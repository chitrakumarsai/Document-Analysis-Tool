import pandas as pd
import io
import json
import time
from typing import List
from app.config import settings
from openai import AzureOpenAI

async def process_patents(
    file, title_col: str, abstract_col: str, claims_col: str,
    custom_prompt: str, base_prompt_template: str
):
    # Load file
    contents = await file.read()
    if file.filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    elif file.filename.endswith(('.xls', '.xlsx')):
        df = pd.read_excel(io.BytesIO(contents), engine="openpyxl")
    else:
        return {"error": "Unsupported file format"}

    # Combine text
    df['combined_text'] = df.apply(
        lambda row: base_prompt_template.format(
            title=row[title_col],
            abstract=row[abstract_col],
            claims=row[claims_col],
            custom=custom_prompt
        ),
        axis=1
    )

    # Setup OpenAI client
    client = AzureOpenAI(
        api_key=settings.OPENAI_KEY,
        api_version=settings.OPENAI_API_VERSION,
        azure_endpoint=settings.OPENAI_ENDPOINT
    )

    results = []

    for _, row in df.iterrows():
        prompt = row['combined_text']

        try:
            response = client.chat.completions.create(
                model=settings.OPENAI_DEPLOYMENT_NAME,
                messages=[
                    {"role": "system", "content": "You are a patent analysis expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content)

            # Ensure required fields
            for field in ["relevance_score", "reasoning", "follow_up_recommended", "SUMMARY"]:
                parsed.setdefault(field, "Not provided")

            results.append(parsed)

        except Exception as e:
            results.append({
                "relevance_score": 0,
                "reasoning": f"Error: {str(e)}",
                "follow_up_recommended": False,
                "SUMMARY": "Failed to analyze"
            })

        time.sleep(0.5)

    df_results = pd.DataFrame(results)
    df_out = pd.concat([df.reset_index(drop=True), df_results], axis=1)

    return json.loads(df_out.to_json(orient="records"))

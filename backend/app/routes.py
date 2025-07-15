# app/routes.py

import pandas as pd
import io
import json
import time
from fastapi import APIRouter, UploadFile, File, Form, Query
from app.config import settings
from openai import AzureOpenAI

router = APIRouter()

@router.post("/columns")
async def get_columns(file: UploadFile = File(...)):
    contents = await file.read()
    if file.filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    elif file.filename.lower().endswith((".xls", ".xlsx")):
        df = pd.read_excel(io.BytesIO(contents), engine="openpyxl")
    else:
        return {"error": "Unsupported file format"}
    return {"columns": df.columns.tolist()}


@router.post("/analyze")
async def analyze_patents(
    file: UploadFile = File(...),
    title_col: str = Form(...),
    abstract_col: str = Form(...),
    claims_col: str = Form(...),
    custom_prompt: str = Form(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("relevance_score"),
    sort_order: str = Query("desc"),
    search: str = Query("")
):
    return await process_patents(
        file,
        title_col=title_col,
        abstract_col=abstract_col,
        claims_col=claims_col,
        base_prompt_template=custom_prompt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search
    )


async def process_patents(
    file,
    title_col: str,
    abstract_col: str,
    claims_col: str,
    base_prompt_template: str,
    page: int = 1,
    page_size: int = 10,
    sort_by: str = "relevance_score",
    sort_order: str = "desc",
    search: str = ""
):
    contents = await file.read()
    if file.filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    else:
        df = pd.read_excel(io.BytesIO(contents), engine="openpyxl")

    # combine the three columns into one text blob
    df["combined_text"] = (
        df[[title_col, abstract_col, claims_col]]
        .fillna("")
        .agg("\n".join, axis=1)
    )

    client = AzureOpenAI(
        api_key=settings.OPENAI_KEY,
        api_version=settings.OPENAI_API_VERSION,
        azure_endpoint=settings.OPENAI_ENDPOINT,
    )

    results = []
    for _, row in df.iterrows():
        prompt = f"{base_prompt_template}\n\n{row['combined_text']}"
        try:
            resp = client.chat.completions.create(
                model=settings.OPENAI_DEPLOYMENT_NAME,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            parsed = json.loads(resp.choices[0].message.content)
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
    full = pd.concat([df.reset_index(drop=True), df_results], axis=1)

    # filter
    if search:
        full = full[full["combined_text"].str.contains(search, case=False, na=False)]

    # sort
    if sort_by in full.columns:
        ascending = sort_order.lower() == "asc"
        full = full.sort_values(by=sort_by, ascending=ascending)

    total_items = len(full)
    total_pages = (total_items + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    page_df = full.iloc[start:end]

    return {
        "results": json.loads(page_df.to_json(orient="records")),
        "metadata": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages
        }
    }

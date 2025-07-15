import pandas as pd

data = pd.read_excel("/Users/chitrakumarsaichv/Library/CloudStorage/OneDrive-kochind.com/Desktop/Projects/koch-3pp/backend/test.xlsx", engine="openpyxl")
print(data.columns.tolist())
from io import BytesIO
from typing import List

import pandas as pd
from pandas import DataFrame


def extract_data_from_xlsx(file_content: bytes) -> List[dict]:
    """Extract the data from a XLSX file."""
    excel_file = BytesIO(file_content)
    sheets = pd.ExcelFile(excel_file)
    sheets_names = sheets.sheet_names
    for sheet in sheets_names:
        if "pbi" in sheet.lower():
            name = sheet
            break
        else:
            name = sheets_names[0]
    df = pd.read_excel(BytesIO(file_content), sheet_name=name)
    df = df.dropna(how="all")
    # Convertir NaN a None
    df = df.astype(object).where(pd.notnull(df), None)
    for col in df.select_dtypes(include=["datetime64[ns]"]).columns:
        df[col] = df[col].astype(str).replace("NaT", None)
    return df


def extract_text_from_df(df: DataFrame):
    """Extract the text from a DataFrame."""
    text = df.to_markdown()
    return text


def write_md_to_file(md_text: str, filename: str):
    """Write the markdown text to a file."""
    md_name = filename.replace(".xlsx", ".md")
    with open(md_name, "w", encoding="utf-8") as f:
        f.write(md_text)
    return {}


def extract_data_to_dicts(df: DataFrame) -> List[dict]:
    """Extract the data from a DataFrame and convert it to a list of dictionaries."""
    dicts = df.to_dict("records")
    return dicts

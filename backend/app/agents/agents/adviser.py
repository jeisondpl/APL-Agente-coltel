from jinja2 import Environment, FileSystemLoader, select_autoescape

PROMPT_TEMPLATES_PATH = "app/agents/prompts"

jinja_env = Environment(
    loader=FileSystemLoader(PROMPT_TEMPLATES_PATH),
    autoescape=select_autoescape(enabled_extensions=()),
    keep_trailing_newline=True,
)
adviser_template = jinja_env.get_template("adviser.txt")


def get_adviser_prompt(**context) -> str:
    return adviser_template.render(**context)


adviser_prompt = get_adviser_prompt()

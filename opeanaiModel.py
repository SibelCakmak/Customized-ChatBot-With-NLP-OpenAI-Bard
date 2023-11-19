import openai

def openaiDevrede(soru):
    openai.api_key = "sk-*****"
    messages = []

    def add_message(role, content):
        messages.append({"role": role, "content": content})

    def converse_with_chatGPT():
        model_engine = "gpt-3.5-turbo"
        response = openai.ChatCompletion.create(
            model=model_engine,
            messages=messages,
            max_tokens=1024,
            n=1,
            stop=None,
            temperature=0.5
        )
        message = response.choices[0].message.content
        return message.strip()

    def process_user_query(prompt):
        user_prompt = (f"{prompt}")
        add_message("system", "You are a helpful assistant.")
        add_message("user", user_prompt)
        result = converse_with_chatGPT()
        print(result)

    def user_query():
        response = process_user_query(soru)
        return response

    user_query()

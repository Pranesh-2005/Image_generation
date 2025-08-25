import gradio as gr
from gradio_client import Client

# Connect to the Qwen-Image-Fast model
client = Client("multimodalart/Qwen-Image-Fast")

# Function to generate images
def generate_image(
    prompt,
    seed=0,
    randomize_seed=True,
    aspect_ratio="16:9",
    guidance_scale=1,
    num_inference_steps=8,
    prompt_enhance=True,
):
    if not prompt.strip():
        return None, "⚠️ Please enter a prompt."

    try:
        result = client.predict(
            prompt=prompt,
            seed=seed,
            randomize_seed=randomize_seed,
            aspect_ratio=aspect_ratio,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            prompt_enhance=prompt_enhance,
            api_name="/infer",
        )
        img_info, seed_out = result
        return img_info["url"], f"✅ Image generated! (Seed: {seed_out})"
    except Exception as e:
        return None, f"❌ Error: {str(e)}"


# Build Gradio app
with gr.Blocks(title="Qwen Image Generator") as demo:
    gr.Markdown("## 🎨 Qwen Image Generator\nEnter a **prompt** and customize settings if needed.")

    with gr.Row():
        prompt_input = gr.Textbox(label="Prompt", placeholder="Enter your prompt...", lines=2)

    with gr.Accordion("⚙️ Customization (Optional)", open=False):
        seed = gr.Number(label="Seed (default: 0)", value=0)
        randomize_seed = gr.Checkbox(label="Randomize Seed", value=True)
        aspect_ratio = gr.Radio(
            ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"],
            label="Aspect Ratio",
            value="16:9"
        )
        guidance_scale = gr.Slider(1, 10, value=1, step=1, label="Guidance Scale (CFG)")
        num_inference_steps = gr.Slider(1, 50, value=8, step=1, label="Number of Inference Steps")
        prompt_enhance = gr.Checkbox(label="Prompt Enhance", value=True)

    generate_btn = gr.Button("🚀 Generate Image")
    output_img = gr.Image(label="Generated Image")
    status = gr.Textbox(label="Status", interactive=False)

    generate_btn.click(
        fn=generate_image,
        inputs=[prompt_input, seed, randomize_seed, aspect_ratio, guidance_scale, num_inference_steps, prompt_enhance],
        outputs=[output_img, status]
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0",server_port=7860,pwa=True)

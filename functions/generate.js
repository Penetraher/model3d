import { Client } from "https://esm.sh/@gradio/client@1.8.0";

const SPACE = "tencent/Hunyuan3D-2";

export async function onRequestPost({ request }) {
  try {
    const form = await request.formData();
    const prompt = (form.get("prompt") || "").toString();
    const image = form.get("image");

    const app = await Client.connect(SPACE);

    const payload = {
      caption: prompt,
      image: image && image.size ? image : null,
      steps: 30,
      guidance_scale: 5.0,
      seed: 1234,
      octree_resolution: 256,
      check_box_rembg: true,
      num_chunks: 200000,
      randomize_seed: true,
    };

    const result = await app.predict("/shape_generation", payload);
    const files = result.data.filter((d) => d && d.url);
    const glb = files.find((f) => (f.url || "").includes(".glb")) || files[0];

    if (!glb) {
      return json({ error: "Сервис не вернул модель" }, 502);
    }
    return json({ url: glb.url });
  } catch (e) {
    return json({ error: String(e.message || e) }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

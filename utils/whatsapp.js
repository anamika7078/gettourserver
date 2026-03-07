// Minimal WhatsApp Cloud API helper with safe fallbacks
// Requires:
//   WHATSAPP_TOKEN: Meta WhatsApp API access token
//   WHATSAPP_PHONE_ID: Your WhatsApp Business phone number ID

export async function sendWhatsapp({ to, text }) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    // sanitize phone to digits only (e.g., "+971501234567" -> "971501234567")
    const toSanitized = String(to || "").replace(/\D/g, "");

    if (!token || !phoneId || !toSanitized) {
        console.log("No WhatsApp config or recipient — whatsapp fallback:", { to, text });
        return Promise.resolve();
    }

    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    const payload = {
        messaging_product: "whatsapp",
        to: toSanitized,
        type: "text",
        text: { body: text },
    };

    try {
        // Prefer global fetch if available (Node 18+)
        if (typeof fetch === "function") {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`WhatsApp API error ${res.status}: ${errText}`);
            }
            return;
        }
    } catch (err) {
        console.error("sendWhatsapp error:", err);
        // Don't throw, keep API flow non-blocking
        return;
    }

    // If fetch not available, fallback to logging
    console.log("fetch not available — whatsapp fallback:", { to, text });
}

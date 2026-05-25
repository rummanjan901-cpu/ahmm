import React, { useState } from 'react';
import { Copy, Sparkles, Upload, Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [style, setStyle] = useState('Professional');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const GROQ_API_KEY = "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";

  const styles = [
    { name: 'Funny', emoji: '😂' },
    { name: 'Savage', emoji: '🔥' },
    { name: 'Professional', emoji: '💼' },
    { name: 'Flirty', emoji: '😏' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = async () => {
    if (!generatedReply) return;
    await navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateReply = async () => {
    if (!inputText && !image) {
      setError('Please provide either text or an image message to reply to.');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedReply('');

    try {
      const model = image ? "llama-3.2-11b-vision-preview" : "llama3-8b-8192";
      
      const systemPrompt = `You are an expert AI reply generator. Generate a response that matches the style: "${style}". 
      Keep it contextually relevant, engaging, and direct. Do not include introductory text like "Here is your reply:", just output the exact reply payload itself.`;

      const userContent = [];
      
      if (inputText) {
        userContent.push({ type: "text", text: `Context/Message to reply to: ${inputText}` });
      }
      
      if (imagePreview) {
        userContent.push({
          type: "image_url",
          image_url: { url: imagePreview }
        });
        if (!inputText) {
          userContent.push({ type: "text", text: "Look at this image and generate an appropriate reply to whatever is happening or written in it." });
        }
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedReply(data.choices[0].message.content.trim());
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black">
      <div className="w-full max-w-2xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AI Reply Generator
            </h1>
            <p className="text-xs text-slate-400">Craft the perfect response instantly.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Message context / Text</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the text message you received..."
              className="w-full h-28 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Upload Image (Optional)</label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-sm font-medium text-slate-300 transition-all">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Choose Image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              {imagePreview && (
                <div className="flex items-center gap-3 w-full sm:w-auto bg-black/30 p-2 rounded-xl border border-white/5">
                  <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs font-medium text-slate-300 truncate">{image?.name}</p>
                    <button onClick={() => { setImage(null); setImagePreview(null); }} className="text-[10px] text-rose-400 hover:underline block mt-0.5">
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Reply Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {styles.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setStyle(s.name)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    style === s.name
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span>{s.emoji}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={generateReply}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Generate Reply</span>}
          </button>

          {generatedReply && (
            <div className="mt-8 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-indigo-400">Suggested Reply</label>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 transition-all"
                >
                  {copied ? <span className="text-emerald-400">Copied!</span> : <span>Copy</span>}
                </button>
              </div>
              <div className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-slate-200 text-sm whitespace-pre-wrap">
                {generatedReply}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

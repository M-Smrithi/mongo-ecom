"use client";

import { useEffect, useState } from "react";

function getRecommendations(prompt, products) {
  const query = prompt.toLowerCase();
  const keywords = query.split(/\s+/).filter((word) => word.length > 2);

  return products
    .map((product) => {
      const haystack = `${product.title} ${product.description} ${product.category}`.toLowerCase();
      let score = 0;

      if (
        (haystack.includes("laptop") || haystack.includes("keyboard") || haystack.includes("mouse")) &&
        (query.includes("coding") || query.includes("developer") || query.includes("program") || query.includes("study"))
      ) {
        score += 8;
      }

      if (
        (haystack.includes("gaming") || haystack.includes("game")) &&
        (query.includes("gaming") || query.includes("game"))
      ) {
        score += 8;
      }

      if (
        (haystack.includes("shoe") || haystack.includes("sneaker") || haystack.includes("running")) &&
        (query.includes("shoe") || query.includes("run") || query.includes("sport"))
      ) {
        score += 8;
      }

      if (
        (haystack.includes("shirt") || haystack.includes("hoodie") || haystack.includes("jeans")) &&
        (query.includes("wear") || query.includes("shirt") || query.includes("style"))
      ) {
        score += 8;
      }

      keywords.forEach((word) => {
        if (haystack.includes(word)) score += 2;
      });

      if (product.category.toLowerCase() === query) score += 3;

      return { ...product, score };
    })
    .filter((product) => product.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi! Tell me what you want and I’ll suggest matching products from the catalog.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.toLowerCase();

    return (
      product.title?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.title);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        text: `Show me ${product.title}`,
      },
    ]);
  };

  const handleAskAssistant = (event) => {
    event.preventDefault();

    if (!chatInput.trim()) return;

    const prompt = chatInput.trim();
    const userMessage = {
      id: Date.now(),
      role: "user",
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsThinking(true);

    const recommendations = getRecommendations(prompt, products);

    window.setTimeout(() => {
      const responseText =
        recommendations.length > 0
          ? `I found a few strong matches for “${prompt}”:`
          : `I couldn’t find a close match yet. Try describing the use case, budget, or style.`;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: responseText,
          suggestions: recommendations,
        },
      ]);
      setIsThinking(false);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row">
        <section className="flex-1">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">
                Shop Catalog
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">All Products</h1>
            </div>

            <div className="w-full max-w-md">
              <label
                htmlFor="product-search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Search Products
              </label>

              <input
                id="product-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Try shoes, shirts, or electronics"
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
              No products matched your search.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                        {product.category}
                      </span>

                      <span className="text-sm text-slate-500">
                        {product.stock || 0} in stock
                      </span>
                    </div>

                    <h2 className="mb-2 text-xl font-semibold text-slate-900">
                      {product.title}
                    </h2>

                    <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-slate-900">₹{product.price}</p>

                      <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="w-full xl:w-[360px]">
          <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">
                AI Assistant
              </p>
              <h2 className="text-xl font-semibold text-slate-900">Need help choosing?</h2>
            </div>

            <div className="mb-4 flex h-80 flex-col gap-3 overflow-y-auto rounded-2xl bg-slate-50 p-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                    message.role === "assistant"
                      ? "self-start bg-white text-slate-700"
                      : "ml-auto bg-indigo-600 text-white"
                  }`}
                >
                  <p>{message.text}</p>

                  {message.suggestions?.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {message.suggestions.map((suggestion) => (
                        <li key={suggestion._id}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full rounded-lg bg-slate-100 px-2 py-2 text-left text-xs text-slate-700 transition hover:bg-slate-200"
                          >
                            <span className="font-semibold text-slate-900">{suggestion.title}</span>
                            <span className="ml-1">• {suggestion.category}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="self-start rounded-2xl bg-white px-3 py-2 text-sm text-slate-700">
                  Thinking...
                </div>
              )}
            </div>

            <form onSubmit={handleAskAssistant} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type something like: I want a laptop for coding"
                className="flex-1 rounded-full border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="submit"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Ask
              </button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [input, setInput] = useState("");
  const [country, setCountry] = useState("India");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const keywordsPerPage = 20;

  async function research() {
    if (!input.trim()) {
      setError("Please enter a topic or landing page.");
      return;
    }

    setLoading(true);
    setRows([]);
    setError("");
    setCurrentPage(1);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: input,
          country,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (!data.keywords || !Array.isArray(data.keywords)) {
        throw new Error("The AI returned an unexpected response.");
      }

      setRows(data.keywords);
    } catch (err) {
      setError(err.message || "Unable to research keywords.");
    } finally {
      setLoading(false);
    }
  }

  const filteredRows = rows.filter((row) => {
    const keyword = row.keyword?.toLowerCase() || "";
    const intent = row.intent || "";

    const matchesSearch = keyword.includes(search.toLowerCase());
    const matchesIntent =
      intentFilter === "All" || intent === intentFilter;

    return matchesSearch && matchesIntent;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / keywordsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * keywordsPerPage;
  const visibleRows = filteredRows.slice(
    startIndex,
    startIndex + keywordsPerPage
  );

  function changePage(page) {
    setCurrentPage(page);
    window.scrollTo({
      top: 450,
      behavior: "smooth",
    });
  }

  function exportCSV() {
    if (!rows.length) return;

    const headers = [
      "Keyword",
      "Search Volume",
      "12M Trend",
      "Intent",
      "AI Opportunity",
    ];

    const csvRows = rows.map((row) => [
      row.keyword || "",
      "",
      "",
      row.intent || "",
      row.opportunity || "",
    ]);

    const csvContent = [
      headers,
      ...csvRows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "keyword-ai-research.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    if (!rows.length) return;

    const excelData = rows.map((row) => ({
      Keyword: row.keyword || "",
      "Search Volume": "",
      "12M Trend": "",
      Intent: row.intent || "",
      "AI Opportunity": row.opportunity || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
      { wch: 42 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Keywords"
    );

    XLSX.writeFile(
      workbook,
      "keyword-ai-research.xlsx"
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: 64,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          padding: "0 36px",
          fontWeight: 800,
          fontSize: 20,
        }}
      >
        KEYWORD
        <span
          style={{
            marginLeft: 7,
            color: "#6b7280",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          AI
        </span>
      </header>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "54px 24px",
        }}
      >
        {/* Hero */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 38,
          }}
        >
          <h1
            style={{
              fontSize: 42,
              margin: "0 0 12px",
            }}
          >
            AI-Powered Keyword Research
          </h1>

          <p
            style={{
              color: "#6b7280",
              fontSize: 17,
            }}
          >
            Discover keywords, search demand, trends and opportunities
          </p>
        </div>

        {/* Research Box */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,.05)",
          }}
        >
          <label
            style={{
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            TOPIC OR LANDING PAGE
          </label>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 10,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  research();
                }
              }}
              placeholder="e.g. MBA in UK or https://example.com/mba-in-uk"
              style={{
                flex: 1,
                padding: "15px 16px",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                fontSize: 15,
                outline: "none",
              }}
            />

            <button
              onClick={research}
              disabled={loading}
              style={{
                padding: "0 24px",
                border: 0,
                borderRadius: 10,
                background: loading ? "#6b7280" : "#111827",
                color: "#fff",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Researching..." : "Research Keywords"}
            </button>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 14,
            }}
          >
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            >
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Canada</option>
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            >
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              marginTop: 24,
              background: "#fff",
              borderRadius: 14,
              padding: 24,
              textAlign: "center",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              🤖 AI is researching your topic...
            </div>

            <div
              style={{
                marginTop: 8,
                color: "#6b7280",
              }}
            >
              Understanding topic → Generating 100 keywords → Analyzing intent
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            style={{
              marginTop: 24,
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
              borderRadius: 14,
              padding: 18,
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {rows.length > 0 && !loading && (
          <>
            {/* Stats */}
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  AI Keywords
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    marginTop: 7,
                  }}
                >
                  {rows.length}
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  Search Volume
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    marginTop: 7,
                  }}
                >
                  —
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginTop: 4,
                  }}
                >
                  Google data coming next
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  Search Trends
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    marginTop: 7,
                  }}
                >
                  —
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginTop: 4,
                  }}
                >
                  Google Trends coming next
                </div>
              </div>
            </div>

            {/* Search + Filter + Export */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 18,
                marginBottom: 14,
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search keywords..."
                style={{
                  flex: 1,
                  minWidth: 240,
                  padding: "11px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />

              <select
                value={intentFilter}
                onChange={(e) => {
                  setIntentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "11px 14px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              >
                <option>All</option>
                <option>Informational</option>
                <option>Commercial</option>
                <option>Transactional</option>
                <option>Navigational</option>
              </select>

              <button
                onClick={exportCSV}
                style={{
                  padding: "11px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ↓ Export CSV
              </button>

              <button
                onClick={exportExcel}
                style={{
                  padding: "11px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ↓ Export Excel
              </button>
            </div>

            {/* Table */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 20,
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                AI Keyword Opportunities
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 850,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f9fafb",
                        textAlign: "left",
                      }}
                    >
                      {[
                        "Keyword",
                        "Volume",
                        "12M Trend",
                        "Intent",
                        "AI Opportunity",
                      ].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: 14,
                            borderTop: "1px solid #e5e7eb",
                            fontSize: 12,
                            color: "#6b7280",
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {visibleRows.map((row, index) => (
                      <tr
                        key={`${row.keyword}-${index}`}
                      >
                        <td
                          style={{
                            padding: 14,
                            borderTop: "1px solid #f1f5f9",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {row.keyword}
                        </td>

                        <td
                          style={{
                            padding: 14,
                            borderTop: "1px solid #f1f5f9",
                            color: "#9ca3af",
                          }}
                        >
                          —
                        </td>

                        <td
                          style={{
                            padding: 14,
                            borderTop: "1px solid #f1f5f9",
                            color: "#9ca3af",
                          }}
                        >
                          Not connected
                        </td>

                        <td
                          style={{
                            padding: 14,
                            borderTop: "1px solid #f1f5f9",
                          }}
                        >
                          {row.intent}
                        </td>

                        <td
                          style={{
                            padding: 14,
                            borderTop: "1px solid #f1f5f9",
                            fontWeight: 800,
                          }}
                        >
                          {row.opportunity}/100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                style={{
                  padding: 18,
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: 13,
                  }}
                >
                  Showing{" "}
                  {filteredRows.length === 0
                    ? 0
                    : startIndex + 1}{" "}
                 –{" "}
                  {Math.min(
                    startIndex + keywordsPerPage,
                    filteredRows.length
                  )}{" "}
                  of {filteredRows.length} keywords
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() =>
                      changePage(Math.max(1, safePage - 1))
                    }
                    disabled={safePage === 1}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 7,
                      background: "#fff",
                      cursor:
                        safePage === 1
                          ? "not-allowed"
                          : "pointer",
                      opacity: safePage === 1 ? 0.5 : 1,
                    }}
                  >
                    ← Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => changePage(page)}
                      style={{
                        minWidth: 36,
                        padding: "8px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: 7,
                        background:
                          page === safePage
                            ? "#111827"
                            : "#fff",
                        color:
                          page === safePage
                            ? "#fff"
                            : "#111827",
                        fontWeight:
                          page === safePage ? 700 : 500,
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      changePage(
                        Math.min(totalPages, safePage + 1)
                      )
                    }
                    disabled={safePage === totalPages}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 7,
                      background: "#fff",
                      cursor:
                        safePage === totalPages
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        safePage === totalPages ? 0.5 : 1,
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
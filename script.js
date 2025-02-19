// Anpassung der API-Integration für Mistral
async function fetchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const question = urlParams.get("question");
    if (!question) {
        document.getElementById("resultTable").innerHTML = "No question provided.";
        return;
    }
    
    // Mistral API Anfrage
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer ag:44e187cb:20250219:gemeinwohl-berater-in:a879293c"
        },
        body: JSON.stringify({
            model: "mistral-medium",
            messages: [{ role: "user", content: question }],
            temperature: 0.7
        })
    });
    
    const data = await response.json();
    const answer = data.choices[0].message.content;
    
    // Ergebnisse anzeigen
    let tableHTML = `<table><tr><th>Antwort</th></tr>`;
    tableHTML += `<tr><td>${answer}</td></tr>`;
    tableHTML += "</table>";
    document.getElementById("resultTable").innerHTML = tableHTML;
}

// Event-Listener für Enter-Taste im Inputfeld
if (document.getElementById("question")) {
    document.getElementById("question").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            submitQuestion();
        }
    });
}

// Falls wir auf results.html sind, Ergebnisse abrufen
if (window.location.pathname.includes("results.html")) {
    fetchResults();
}

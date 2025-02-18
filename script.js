function submitQuestion() {
    let question = document.getElementById("question").value;
    if (question.trim() === "") {
        alert("Please enter a question.");
        return;
    }
    window.location.href = `results.html?question=${encodeURIComponent(question)}`;
}

async function fetchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const question = urlParams.get("question");
    if (!question) {
        document.getElementById("resultTable").innerHTML = "No question provided.";
        return;
    }
    
    const response = await fetch(`https://gemeinwohl-api.onrender.com/evaluate/?question=${encodeURIComponent(question)}`);
    const data = await response.json();
    
    let tableHTML = "<table><tr><th>Dimension</th><th>Score</th></tr>";
    for (const [dimension, score] of Object.entries(data.scores)) {
        tableHTML += `<tr><td>${dimension}</td><td>${score}</td></tr>`;
    }
    tableHTML += "</table>";
    document.getElementById("resultTable").innerHTML = tableHTML;
    
    let dimensions = Object.keys(data.scores);
    let scores = Object.values(data.scores);
    let plotData = [{
        type: 'scatterpolar',
        r: scores,
        theta: dimensions,
        fill: 'toself'
    }];
    
    let layout = {
        polar: { radialaxis: { visible: true, range: [1, 6] } },
        showlegend: false,
        title: "Public Value Netzdiagramm"
    };
    
    Plotly.newPlot('chart', plotData, layout);
}

if (document.getElementById("question")) {
    document.getElementById("question").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            submitQuestion();
        }
    });
}

if (window.location.pathname.includes("results.html")) {
    fetchResults();
}

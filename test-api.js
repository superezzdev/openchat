

async function runTests() {
  console.log("Creating a match...");
  const createMatchRes = await fetch('http://localhost:8000/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sport: "football",
      homeTeam: "Team A",
      awayTeam: "Team B",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
    })
  });
  const matchData = await createMatchRes.json();
  console.log("Match Create:", matchData);

  if (!matchData.match) {
    console.error("Failed to create match!");
    return;
  }

  const matchId = matchData.match.id;

  console.log("\nCreating commentary...");
  const createCommentaryRes = await fetch(`http://localhost:8000/matches/${matchId}/commentary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minute: 12,
      message: "Great goal!",
      team: "Team A"
    })
  });
  const commentaryData = await createCommentaryRes.json();
  console.log("Commentary Create:", commentaryData);

  console.log("\nFetching commentary...");
  const getCommentaryRes = await fetch(`http://localhost:8000/matches/${matchId}/commentary`);
  const fetchedCommentary = await getCommentaryRes.json();
  console.log("Commentary Fetch:", fetchedCommentary);
}

runTests().catch(console.error);

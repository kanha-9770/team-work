CASE 1 — Finish Feature A, THEN Start Feature B (BEST)
🔹 Step 1: Start Feature A
git checkout develop
git pull origin develop

git checkout -b feature/dev-user-profile
🔹 Step 2: Work + Commit
git add .
git commit -m "feat(profile): initial setup"
🔹 Step 3: Push + PR
git push origin feature/dev-user-profile

👉 Create PR → develop

🔹 Step 4: Get it merged
🔹 Step 5: CLEANUP
git checkout develop
git pull origin develop

git branch -d feature/dev-user-profile
🔹 Step 6: Start Feature B
git checkout -b feature/dev-notifications

✔ This is the cleanest workflow
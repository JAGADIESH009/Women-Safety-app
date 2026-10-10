# PROJECT SKILL POLICY & ARCHITECTURE GUIDELINES

This project is: "Smart Women Security Application Using Artificial Intelligence, IoT, and Cloud Computing"

## Workflow Rules
Before EVERY implementation, debugging, refactoring, UI change, or testing task:
1. FIRST inspect the available installed skills.
2. Select and use the BEST relevant skills for the specific task.
3. Do not use unrelated skills just for the sake of using them.
4. Preserve the existing project architecture and working functionality.
5. Do not rewrite working parts unless the task requires it.

## Core Skills Priority
- **UI / DESIGN**: `design-taste-frontend`, `design-md`, `web-design-guidelines`, `redesign-existing-projects`
- **REACT NATIVE / EXPO**: `vercel-react-native-skills`
- **WEB TESTING**: `playwright-cli`
- **COMPLEX IMPLEMENTATIONS**: `full-output-enforcement`

## Execution Rules
- **A. NEVER blindly load every skill.** Only use skills that materially help the current task.
- **B. BEFORE CODING:** Inspect existing implementation, understand architecture, reuse existing components/themes.
- **C. AFTER CODING:** Run appropriate tests (Playwright for Web), check runtime errors, test actual user flows.
- **D. IF SOMETHING BREAKS:** Find root cause -> fix it -> run again -> verify -> continue until it works. Do NOT stop at diagnosis.
- **E. DO NOT CLAIM FUNCTIONALITY THAT DOES NOT EXIST.** No fake notifications, SMS, calls, AI predictions, GPS data, cloud uploads, or emergency responses.
- **F. DO NOT CHANGE UNRELATED FEATURES.** Preserve working features like Home, SOS, Map, Authentication.
- **G. MOBILE + WEB:** Keep Android/mobile behavior intact when making Web-specific changes.
- **H. DESIGN:** Maintain one coherent design system across the application (Light / Dark / Device modes).

## Project Roadmap
**CURRENT PRIORITY: Phase 2 (Firebase Auth, Real GPS, Maps, Basic SOS/location workflow)**
Do NOT jump to advanced features (AI, IoT, wearables, fake features) while core functionality is incomplete.

- better inclusion of krabs-sdk in other projects (instead of npm link)
- Rename task-run to task-configuration

CLI

- Generate moore sensible docs

backend

- queue management
  - when queueing a task you have to be able to give a list of tasks that need to be resolved first
- fix krabs on startup picking up many tasks
  - Actually I looked into this, it just runs 2x the amount of jobs it should, due to using npm run start:dev
- Better config handling
- Add remove from queue
- Add way to stop active task
- Can we run the tasks in a separate process?
- Crud for task-run
- Make API more restful (/task-result/task-result-output) => /task/result/output

Frontend

- loading skeletons
- reactive elements after actions;
  - loading skeletons
  - loading spinners
  - toasts/sonner
    - success
    - error
- Make running tasks available in sidebar
  - Also task runs
  - And make it configurable
- Show task runs in frontend
  - including crud

Tasks

- Allow tasks to be scheduled
- Allow tasks to run at an interval

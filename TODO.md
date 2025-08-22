- better inclusion of krabs-sdk in other projects (instead of npm link)
- Rename task-run to task-configuration

CLI

- Generate moore sensible docs

backend

- queue management
  - when queueing a task you have to be able to give a list of tasks that need to be resolved first
- task result output should be separate entity
- fix krabs on startup picking up many tasks
- Better config handling
- purging active task-result/queue

Frontend

- loading skeletons
- reactive elements after actions;
  - loading skeletons
  - loading spinners
  - toasts/sonner
    - success
    - error

Tasks

- Allow tasks to be scheduled
- Allow tasks to run at an interval

- better inclusion of krabs-sdk in other projects (instead of npm link)
- Rename task-run to task-configuration

CLI

- Only show controller methods meant for the CLI

backend

- queue management
  - when queueing a task you have to be able to give a list of tasks that need to be resolved first
- activity module
  - read only to get list of active tasks
  - get list of queued tasks in a specific queue
  - read only to get activity within one task (future)
- Better config handling

Frontend

- Create k-command-or-mange
  - Visual update to task header/task edit header
    - including run tasks
  - Visual update to edit argument
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

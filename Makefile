# Makefile
run:
	uvicorn backend.main:app --reload

init:
	mkdir -p data static templates
	touch data/todo.json data/jobs.json data/expenses.json data/users.json
	echo "[]" > data/todo.json
	echo "[]" > data/jobs.json
	echo "[]" > data/expenses.json
	echo "[]" > data/users.json
	pip install -r requirements.txt
lint:
	flake8 backend
test:
	pytest --maxfail=1 --disable-warnings -q
clean:
	rm -rf __pycache__ data/*.json
.PHONY: run init lint test clean

# Commit and push all changes
push:
	@git add .
	@git status
	@git commit -m "Update"
	@git push

# Pull the latest changes
pull:
	@git pull


# This Makefile provides commands to run the FastAPI application, initialize the project structure,
# lint the code, run tests, and clean up temporary files.
# The 'run' command starts the FastAPI server with hot reloading.
# The 'init' command sets up the necessary directories and files.
# The 'lint' command checks the code for style issues using flake8.
# The 'test' command runs the tests using pytest.
# The 'clean' command removes cached files and JSON data files.
# To use this Makefile, run the following commands in your terminal:
# - `make run` to start the server
# - `make init` to initialize the project
# - `make lint` to check code style
# - `make test` to run tests
# - `make clean` to remove temporary files
# Ensure you have Python and pip installed, and that you are in the project directory.
# You can also customize the commands as needed for your project.
# Note: The Makefile assumes you have a 'requirements.txt' file with the necessary dependencies.
# The 'uvicorn' command is used to run the FastAPI application, and it will automatically reload when code changes are detected.
# The 'flake8' command is used for linting, and 'pytest' is used for running tests.
# The 'clean' command is useful for removing any cached files or temporary data that may have been created during development.
# This Makefile is a simple way to manage your FastAPI project, making it easier to run, test, and maintain.
# You can add more commands as needed, such as for building Docker images or deploying the application.
# Make sure to run `make init` before running other commands to set up the project structure.
# You can also modify the commands to suit your development workflow.
# The Makefile is designed to be simple and effective for managing a FastAPI project.
# It provides a clear structure for common tasks, making it easier to work on the project.
# The commands can be executed in a terminal that supports Makefiles, such as bash or zsh.
# The Makefile is a convenient way to automate common tasks in your FastAPI project.
# You can also add additional commands for tasks like building Docker images, deploying to a server, or generating documentation.
# The Makefile is a powerful tool for managing your FastAPI project, providing a simple way to run, test, and maintain your application.
# You can customize the commands to fit your specific development workflow and project requirements.
# The Makefile is designed to be easy to use and understand, making it accessible for developers of all skill levels.
# The commands provided in this Makefile are a great starting point for managing your FastAPI project.
# You can expand it with additional commands as your project grows.
# The Makefile is a flexible tool that can be adapted to your project's needs.
# It provides a simple way to manage your FastAPI application, making it easier to run, test, and maintain.
# The Makefile is a great way to streamline your development workflow, providing a clear structure for common tasks.
# You can run the commands in your terminal to perform various tasks related to your FastAPI project.
# The Makefile is a powerful tool for automating tasks in your FastAPI project, making it easier to manage and maintain.
# You can customize the commands to fit your specific needs and development workflow.
# The Makefile is a simple yet effective way to manage your FastAPI project, providing a clear structure for common tasks.
# You can run the commands in your terminal to perform various tasks related to your FastAPI application.
# The Makefile is designed to be easy to use and understand, making it accessible for developers of all skill levels.
# The commands provided in this Makefile are a great starting point for managing your FastAPI project.
# You can expand it with additional commands as your project grows.	
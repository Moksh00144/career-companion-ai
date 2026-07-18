Here is a Product Requirements Document (PRD) structured based on the provided project brief.

# Product Requirements Document (PRD): Vibe Coding AI Web Application

**Collaborators:** Bharat Cares by SMEC Trust & IBM
**Project Category:** AI-Assisted Web Application Development & Cloud Deployment

---

## 1. Objective

The objective of this project is to conceptualize, build, and publicly deploy a full-stack, AI-powered web application. This will assess the ability to act as an architect and creative director in an AI-first development workflow by utilizing prompt engineering, AI-native coding environments, and Amazon Web Services (AWS).

## 2. Product Scope & Themes

The application must be original, developed during the course, and can be built by an individual or a team of 2-3 members. The specific product concept is flexible, but it must utilize AI as a core feature.

Suggested application themes include, but are not limited to:

* **AI Chat Interface:** Domain-specific conversational assistants (e.g., finance, education, wellness).


* **Content Generation Tool:** Applications for generating emails, summaries, or creative writing.


* **Document Analyzer:** Tools for AI-powered extraction, analysis, or rewriting of pasted text or PDFs.


* **AI Recommendation Engine:** Systems providing personalized suggestions (e.g., career paths, movies) based on user inputs.


* **Productivity Assistant:** AI-powered daily planners, task managers, or meeting summarizers.


* **Learning & Quiz Tool:** Subject-specific quiz generators or AI tutors.


* **Data Explainer:** Tools that generate plain-language insights from CSVs or raw data.


* **Multilingual Tool:** Language-learning, localization, or translation assistants.


* **Custom GPT-Style Agent:** Role-specific personas like recipe generators, fitness coaches, or legal assistants.



---

## 3. Functional Requirements

* **Frontend Interface:** The application must have a fully functional frontend with a clear user interface.


* **Backend Server:** The application must include a working backend server that handles API routing.


* **LLM Integration:** The backend must connect to an external AI model API (e.g., OpenAI GPT, Anthropic Claude).


* **Live Responses:** The application must return live AI-generated responses to the end user.


* **Real-time Streaming:** Text responses must render progressively (stream) in the UI rather than loading all at once after a delay.



## 4. Non-Functional Requirements & Security

* **Responsiveness:** The user interface must be optimized and functional on both desktop and mobile browsers.


* **Security:** Secret keys and credentials must be kept secure on the server side and must never appear in frontend code or version control.


* **Environment Variables:** Sensitive credentials must be managed using environment variables.


* **Cost Management:** AWS budget alerts must be configured to prevent unexpected charges, utilizing free tier services for the project.


* **Vibe Coding Methodology:** AI tools must be utilized for code generation, debugging, and design.



---

## 5. Technical Stack & Infrastructure

* **Frontend Technologies:** HTML/CSS/JavaScript or an equivalent frontend framework.


* **Backend Technologies:** Node.js Express or Python FastAPI.


* **Containerization:** The full application stack must be packaged into a Docker container, including a functional Dockerfile.


* **Cloud Deployment:** The containerized app must be deployed to AWS (e.g., Elastic Beanstalk, App Runner).


* **Accessibility:** The deployed application must be accessible to the public via an HTTPS URL.



---

## 6. Deliverables

The project requires the submission of three core deliverables:

### 6.1 Project Concept Note (PDF)

A document outlining the strategic vision of the app, including:

* Project title and the name of the application.


* The objective or problem statement.


* Target use case and user demographics.


* The specific LLM model and API being utilized.


* Key features of the application.


* The expected outcomes and user experience.



### 6.2 Live Application

* A fully functional, publicly accessible web application.


* The live AWS HTTPS URL must be pasted into both the Concept Note and the Project Report.



### 6.3 Project Report

A comprehensive written report documenting the development lifecycle, covering:

* An overview of the application and the chosen tech stack.


* The prompting frameworks and strategies used, including sample prompts.


* A summary of the development process, broken down phase-by-phase.


* The architecture of the application.


* A breakdown of challenges faced and the resolutions implemented.


* Personal reflections and key learnings from the project.



---

## 7. Evaluation Criteria

The project will be evaluated based on the following weighted criteria:

* **Technical Implementation & Vibe Coding Methodology:** 25%


* **Prompt Engineering Quality & Documentation:** 20%


* **Cloud Deployment & AWS Architecture:** 20%


* **Application Design & User Experience:** 20%


* **Report Quality, Reflection & Clarity:** 15%
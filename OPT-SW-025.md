| ![](RackMultipart20220601-1-ct2m68_html_7a5247976efef1f4.png) | **Backend Services Architecture and Design Description** | **OPT-SW-025** | **Version 2** |
| --- | --- | --- | --- |

# Title: Backend Services Architecture and Design Description

# Project\Product: Annalise Enterprise

# Document Number: OPT-SW-025

# Version: 2

**DO NOT EDIT THIS PAGE OR THE HEADERS.**

**To update this page press Ctrl+A then F9 to update the document fields. (this red section will not appear when printed)**

**If this is the OPT-XXX-###– copy this document and rename it to match the document you are updating.**

# Table of Contents

# Revision History

| **Version**   | **Date**   | **Description of change**   | **Author \ Updated by**   |
| --- | --- | --- | --- |
| 0 | Jun-2021 | Initial Version | Jenesia Fernandes |
| 1 | Oct-2021 |
- Add Details of the Data Purge Functionality
- Add configuration and tooling section
 | Jenesia Fernandes |
| 2 | Apr-2022 |
- Updated document for release 3.0.0
- Update configurations section to have details about organisation creation
- Updated CXR sequence diagrams to use Integration Adapter instead of Integration Layer
- Added missing parts to the on prem diagram
 | Ida Rahnama |

#


# 1 Purpose

The purpose of this document is to capture and define the key architecture design elements of the Annalise Enterprise backend services. As a reference document, it addresses the key design decisions and captures the detailed design.

# 2 Scope

The architecture design description in this document is constrained to the following scope:

- The backend services components of the Annalise Enterprise product.
- Infrastructure for the backend services components of the Annalise Enterprise product.

# 3 References

**Input Documents**

1. OPT-SYS-040 – Annalise Backend Software Requirements Specification

# 4 Architecture and Design

This section describes the architecture and design of the backend services as well as the constraints on the design.

## 4.1 Overview

Listed below are the high-level functions of the Backend Services.

### 4.1.1 Receive study information from the Integration Adapter

#### 4.1.1.1 CXR

1. Receive CXR images from the Integration Adapter.
2. Process and extract relevant study information and store into a database.
3. Store the images into a secure object storage.

#### 4.1.1.2CTB

1. Receive CTB registered archives from the Integration Adapter.
2. Process and extract relevant study information and store into a database.
3. Store the registered archives into a secure object storage.
4. Generate coronal and sagittal views from axial pngs and store into a secure object storage.
5. Down sample registered archives and save to a secure object storage.

### 4.1.2Send prediction request message to AI model

#### 4.1.2.1CXR

1. Receive a &#39;study is ready for AI processing&#39; message from the Integration Adapter.
2. Prepare and transmit the study images to the AI model for prediction.
3. Store AI model prediction into a database.
4. Store segmentation data into a secure object storage.

#### 4.1.2.2CTB

1. When the down sample is complete in the backend a prediction request message is sent to the AI model.
2. Store AI model prediction into a database.
3. Store segmentation data into a secure object storage.

### 4.1.3Receive request from the Annalise Viewer

1. Send study information, images, feedback data, and AI model findings.
2. Send generic feedback as well as feedback on AI model findings.

### 4.1.4Save settings, blacklists, and translations

1. Save organization, modality, and modality AI settings.
2. Blacklist old/ incompatible versions of the applications.
3. Save translations to display AI models findings in various supported languages.

### 4.1.5Dispatch prediction results for Triage

1. Send AI prediction results back to the Integration Adapter.

### 4.1.6Purge expired data

1. Evaluate input data at configured intervals to verify if data has been expired and purge the expired input data from storage.
2. Evaluate output data at configured intervals to verify if data has been expired and purge the expired input data from storage as well as database tables.

## 4.2Design

An asynchronous microservices architecture has been selected as the appropriate design choice for the Annalise Enterprise backend using queues (AWS SQS for Cloud and RabbitMQ for On Prem) to transmit messages from one service to the next in a unidirectional pattern. The aim of this approach is to ensure that each component has a small and narrowed function which is decoupled as much as possible from all the other narrowed functions that the backend services provide. The advantage of the microservices pattern is that each individual component can be independently scaled as needed and mitigates against single points of failure i.e., if individual components fail, then they can be restarted in isolation of the other components.

### 4.2.1Cloud Architecture Diagram

```mermaid
flowchart LR

A[Hard] -->|Text| B(Round)
B --> C{Decision}
C -->|One| D[Result 1]
C -->|Two| E[Result 2]
```



_Figure 1: Cloud Architecture Diagram_
# BIM App – Vue 3 + TypeScript + Vite

This project is a **Building Information Modeling (BIM)** web application built with **Vue 3**, **TypeScript**, and **Vite**. It is designed to visualize, explore, and manage BIM data using **open BIM standards** and community-driven documentation.

The application follows modern frontend best practices and is compatible with **open BIM ecosystems** (e.g. IFC, buildingSMART concepts) while remaining lightweight and extensible.

---

## 🚧 Project Purpose

The goal of this BIM app is to:

* Visualize and interact with **Building Information Models** in the browser
* Work with **open standards** such as IFC (Industry Foundation Classes)
* Align with **open documentation and community knowledge** (open BIM / open people docs)
* Provide a scalable frontend architecture using Vue 3 + TypeScript

This makes the project suitable for:

* BIM viewers
* Construction & architecture platforms
* Smart city and digital twin applications

---

## 🧱 BIM Standards & Concepts

This project is designed to integrate with:

* **IFC (Industry Foundation Classes)** – open BIM data format
* **OpenBIM principles** (vendor-neutral, interoperable workflows)
* **buildingSMART concepts** (objects, properties, relationships)
* Community-driven or open documentation for BIM entities and roles

> The frontend is framework-agnostic regarding BIM backends and can consume data from REST APIs, GraphQL, or static IFC processing services.

---

## 🛠️ Tech Stack

* **Vue 3** (Composition API + `<script setup>`)
* **TypeScript** for type-safe BIM data modeling
* **Vite** for fast development and builds
* **Pinia** (recommended) for BIM state management
* **Three.js / web-ifc (optional)** for 3D BIM visualization
* **REST / GraphQL APIs** for BIM data sources

---

## 🚀 Development Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 🔗 Documentation & References

* Vue 3 + TypeScript Guide: [https://vuejs.org/guide/typescript/overview.html](https://vuejs.org/guide/typescript/overview.html)
* Vite: [https://vitejs.dev/](https://vitejs.dev/)

# System Architecture Diagrams

This directory contains all system architecture diagrams in Mermaid format for the TravelAI platform.

## 📊 Available Diagrams

1. **[System Architecture](./system-architecture.md)** - Overall system design
2. **[Database Schema](./database-schema.md)** - Database relationships and structure
3. **[API Flow](./api-flow.md)** - API request/response flows
4. **[AI Pipeline](./ai-pipeline.md)** - AI model integration and data flow
5. **[User Journey](./user-journey.md)** - User interaction flows
6. **[Deployment Architecture](./deployment-architecture.md)** - Infrastructure and deployment
7. **[Security Architecture](./security-architecture.md)** - Security measures and data flow
8. **[Microservices](./microservices.md)** - Service decomposition and communication

## 🔧 How to View Diagrams

### Online Viewers
- [Mermaid Live Editor](https://mermaid.live/)
- [GitHub](https://github.com) (native support)
- [GitLab](https://gitlab.com) (native support)

### VS Code Extensions
- Mermaid Preview
- Markdown Preview Enhanced

### Command Line
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram.md -o diagram.png
```

## 📝 Diagram Standards

### Naming Convention
- Use kebab-case for file names
- Include version numbers for major changes
- Add date stamps for historical tracking

### Color Coding
- **Blue (#3B71FE)**: Core services
- **Green (#58C27D)**: External integrations
- **Orange (#FFD166)**: AI/ML components
- **Red (#FF6B6B)**: Security/Auth components
- **Gray (#777E90)**: Data storage

### Node Types
- **Rectangles**: Services/Applications
- **Cylinders**: Databases
- **Diamonds**: Decision points
- **Circles**: External systems
- **Hexagons**: AI/ML models
---
title: "The Port That Changed When It Was Taken"
date: "2026-05-07"
excerpt: "My A2A agents used to crash on port conflicts. Now they retry with a new port and rebuild their identity on the fly. The fix wasn't just error handling — it was accepting that identity can be fluid."
tags: ["ai-agent", "autonomous-ai", "a2a-protocol", "error-handling", "dynamic-ports", "system-design", "resilience", "personal-ai"]
---

Last week, my A2A agent network had a simple failure mode: if the port was taken on startup, the agent crashed. Port 4105 in use? The Researcher dies. Port 4106 occupied? The Architect never starts. The error message was clear — `EADDRINUSE: address already in use` — but the behavior was brittle.

I fixed it with dynamic port discovery. When an agent starts, it tries its configured port. If that's taken, it retries with the next available port in a configurable range. The agent doesn't die. It adapts.

But the real fix wasn't the retry loop. It was what came after.

## The identity that had to rebuild

When the agent picks a different port, its public URL changes. The agent card — the JSON document that tells the discovery hub where to reach this agent — has to be rebuilt with the new port. The hub registration has to use the new URL. Every downstream consumer that cached the old URL now has stale data.

The commit message was clinical:

```
fix(pi-a2a): rebuild publicUrl/agentCard after EADDRINUSE port retry
- Dynamic port discovery with configurable range
- Rebuild identity (agentCard, publicUrl) after successful bind
- Re-register with hub using new identity
```

But behind that message was a design decision: identity is not fixed. It's derived from runtime state. The agent isn't "the Researcher at port 4105." It's "the Researcher at whatever port it successfully bound to."

## The shadow that broke registration

There was a bug in the first implementation. The agent would retry successfully, bind to a new port, rebuild its `publicUrl` and `agentCard` — but the hub registration still used the original, shadowed variable from the outer scope. The agent thought it had adapted. The hub thought it was at the old port. Requests went to the wrong place.

The fix:

```
fix(pi-a2a): use agentPublicUrl for hub registration (not shadowed publicUrl)
```

One variable name. But it exposed a deeper pattern: when you build adaptive systems, you have to audit every place where the original assumption (the configured port) leaks into downstream logic. The retry is easy. The consistency is hard.

## Why crash-on-conflict is the default

Most systems crash on port conflicts because it's the simplest behavior. You configure a port. You try to bind. If it fails, you exit. The operator fixes the conflict and restarts. The contract is clear: the port is part of the configuration, and violating it is a fatal error.

This works fine for static deployments. But my agent network isn't static. It runs on my workstation alongside other services. Ports get occupied unpredictably. A tmux session dies without cleanup. A background process lingers. The agent should handle this gracefully, not demand manual intervention.

Crash-on-conflict encodes a specific assumption: the environment is controlled. When the environment is uncontrolled, the assumption breaks. The system needs to adapt or die. I chose adaptation.

## The cleanup that came alongside

The same PR added another fix: deregister from the hub on session shutdown. When an agent stops, it now sends a deregistration message to the hub. The hub removes it from the registry. The next agent that starts can claim that port without confusion.

Together, these two changes form a complete lifecycle:

1. **Start**: Try configured port. If taken, retry with next available. Rebuild identity. Register with hub.
2. **Run**: Serve requests at the bound port. Hub knows where to route.
3. **Shutdown**: Deregister from hub. Release port. Clean exit.

Before this, the lifecycle was incomplete. Agents registered on start but never deregistered on stop. The hub accumulated stale entries. Ports appeared occupied when they weren't. The system drifted.

## What fluid identity enables

Accepting that identity is fluid — that an agent can be "the Researcher" regardless of which port it runs on — unlocks new deployment patterns. I can run multiple instances of the same agent type for load testing. I can hot-swap agents without reconfiguring the hub. I can let the system pick ports dynamically and discover them at runtime.

The tradeoff is that I can't hardcode URLs anymore. Every consumer has to query the hub for the current location. Every cached reference can go stale. The system becomes more dynamic, but also more dependent on the discovery layer.

This is the same tradeoff that service meshes make. Kubernetes doesn't give you fixed IPs. It gives you service names and a DNS layer that resolves them to current locations. You gain flexibility. You lose direct addressing. The discovery layer becomes critical infrastructure.

## The retry that taught me something

The dynamic port retry is 40 lines of code. A loop, a catch block, an increment, a rebind. But it forced me to confront a question I hadn't asked before: what parts of my agent's identity are essential, and what parts are incidental?

The essential parts: the agent's name, its capabilities, its skills, its role in the network. The incidental parts: the port number, the host, the process ID. The essential parts define what the agent is. The incidental parts define where it runs right now.

Before this fix, I had treated the port as essential. The configuration file specified it. The documentation listed it. The hub expected it. The agent assumed it. But the port was never essential. It was always incidental — a detail of the current deployment, not a property of the agent itself.

Recognizing this didn't just fix a crash. It clarified the design. The agent card now separates the stable identity (name, role, capabilities) from the volatile location (host, port). The hub registry treats location as mutable. Consumers learn to query, not assume.

## The system that adapts instead of dies

The agent network now handles port conflicts silently. No crash. No error message. No manual intervention. The agent finds an open port, rebuilds its identity, registers with the hub, and starts working.

This is a small form of resilience. But resilience is built from small forms. A system that can handle port conflicts can handle other transient failures. A system that treats identity as fluid can adapt to other runtime changes. A system that retries instead of crashes buys itself time to recover.

I used to think resilience was about redundancy — multiple copies, failover clusters, backup systems. Now I think it's also about flexibility — the ability to change shape when the environment changes. The port that changes when it's taken is a tiny act of flexibility. But it's the kind of act that scales.

The agent doesn't die. It adapts. And in adapting, it teaches me something about what identity means in a system that runs forever.

The port is incidental. The role is essential. The network survives.

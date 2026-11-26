# Living House model — format 1.0

One JSON file, `*.living-house.json`, up to 5 MB. Validation: `validateModel()` in `graph.js`.
The model is a topological graph: there are no sizes, coordinates or shapes.

```
{
  "format": "living-house-model",     // exactly this value
  "version": "1.0",                   // other versions are refused
  "meta": { "name", "author", "updated" },
  "nodes": [ { "id", "type", "kind"?, "name", "binding"?: { "file", "ref" } } ],
  "links": [ { "type", "from", "to" } ],
  "constitution": { "priorities": [...], "rules": [...] },
  "dna": { "stiffenMaxPercent": 0 }
}
```

## Nodes

| Layer | `type` | `kind` |
|---|---|---|
| space | `site`, `building`, `storey`, `space` | — |
| body | `foundation`, `wall`, `column`, `beam`, `slab`, `roof` (structural, assessed); `window`, `door`, `stair` | — |
| nerves | `sensor` | `strain`, `crack`, `load`, `tilt`, `integrity`, `temperature`, `humidity`, `co2`, `leak` |
| nerves | `mobileSensor`, `chip` | — |
| brain | `centre` | — |
| networks | `network` | `water`, `power`, `gas`, `air`, `repair`, `data` |
| reserves | `reserve` | `structural`, `control` |
| actuators | `material` | `thermal-conductivity`, `transparency`, `reflectance`, `crack-healing`, `leak-sealing` |
| actuators | `device` | `heating`, `cooling`, `ventilation`, `dehumidifier`, `valve` |
| actuators | `measure` | `prop`, `closed-zone` |
| actuators | `robot` | — |

`id` is unique (`F-1`, `W-2`, `SN-1`, `C-1`…). `binding` links a node to an element of the client's project
file attached to the passport (IFC GUID, mark or sheet).

## Links

| `type` | from → to |
|---|---|
| `supports` | body → body (from rests on to) |
| `adjacent` | body ↔ body |
| `contains` | space → space or body |
| `observes` | sensor → body or space |
| `patrols` | mobileSensor → body |
| `transmits` | sensor, mobileSensor, chip → chip or centre |
| `controls` | centre → actuator |
| `actsOn` | actuator → body or space |
| `serves` | network → body or space |
| `feeds` | reserve or centre → network |
| `heals` | material → body |

## Constitution

`priorities`: order of `safety`, `health`, `comfort`, `economy`.
`rules`: `{ id, kind: "limit", sensorKind, min, max }`, `{ id, kind: "forbid", action, from: "HH:MM", to: "HH:MM" }`,
`{ id, kind: "principle", text }`.

## Assessment (`check.js`)

For each structural element: the **continuous** loop (sensor → centre → Constitution limit → actuator → element,
plus continuous healing) and the **one-off repair** loop (integrity sensor or patrol → centre → temporary measure →
repair network fed by structural stock → robot). Green: both closed; red: not sensed at all; yellow: otherwise.

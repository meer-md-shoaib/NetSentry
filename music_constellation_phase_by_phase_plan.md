# Music Constellation — Phase-by-Phase Build Plan

## Project Goal

Build a web application where users provide their music playlist/library data and the application transforms it into an interactive 3D musical universe.

The core experience:

**Music data → enrichment → relationships → coordinates → 3D constellation → exploration**

The system must be real and data-driven. Do not use hardcoded/demo artists or fake relationships in the final implementation.

---

# Critical Rule for the Vibe Coder

## BUILD ONE PHASE AT A TIME.

Do not implement future phases early.

At the end of every phase:

1. Run the application.
2. Test the phase against its acceptance criteria.
3. Fix all errors.
4. Explain what was completed.
5. Wait for approval before starting the next phase.

Do NOT build the entire project in one prompt.

The visual 3D constellation is not the foundation. The data and relationship engine are.

---

# PHASE 1 — Music Data Ingestion

## Objective

Create a reliable system that accepts a user's music data and converts it into a normalized internal format.

### Initial input formats

Support:

- CSV
- JSON

Do NOT implement Apple Music or Spotify account integration yet.

### Minimum normalized fields

Each track should contain:

- `title`
- `artist`
- `album`
- `playlist`
- `source`

Optional fields should be preserved when available:

- `release_date`
- `date_added`
- `play_count`
- `duration`
- `genre`

### Required functionality

- Upload file
- Validate file
- Parse records
- Normalize text
- Remove exact duplicates
- Detect missing artist/title values
- Show import progress
- Show import summary
- Store normalized records

Example summary:

> 1,247 songs imported  
> 83 artists  
> 7 playlists  
> 12 duplicates removed  
> 4 tracks need review

### Acceptance criteria

A real CSV/JSON file can be uploaded and converted into clean internal records.

No visualization is required yet.

---

# PHASE 2 — Music Metadata Enrichment

## Objective

Take normalized tracks and enrich them with useful external metadata.

### Build an enrichment layer

The architecture must allow the metadata provider to be replaced later.

Do not tightly couple the entire application to one API.

### Enrich where available

- Artist metadata
- Album metadata
- Release year/date
- Genres/tags
- Artist relationships
- Artwork
- Track identifiers
- Other useful public metadata

### Requirements

- Cache API results
- Handle missing matches
- Handle rate limits
- Retry safely
- Log failed enrichment
- Never crash the entire import because one track fails

### Acceptance criteria

Imported songs can be matched to external metadata and stored locally.

Show an enrichment report such as:

> 1,247 tracks  
> 1,203 matched  
> 44 unmatched

Do not build the 3D visualization yet.

---

# PHASE 3 — Music Intelligence / Relationship Engine

## Objective

Determine why songs and artists are related.

This is the core intelligence of the project.

### Create multiple relationship signals

#### 1. Metadata similarity

Compare:

- genres
- tags
- artist metadata
- album information

#### 2. Semantic similarity

Generate embeddings from useful text such as:

- artist descriptions
- genres/tags
- track metadata
- lyrics only if legally/technically available

Do not scrape copyrighted lyrics irresponsibly.

#### 3. Playlist relationships

If two tracks repeatedly occur in the same playlists, treat that as a relationship signal.

#### 4. Artist relationships

Use available artist similarity/relationship data.

### Produce a combined similarity score

Conceptually:

`similarity = weighted(metadata + semantic + playlist + artist signals)`

Keep the weighting configurable.

Do not pretend the weights are scientifically perfect. Make them tunable and document them.

### Acceptance criteria

For any selected song/artist, the system can return its strongest related songs/artists with explainable relationship signals.

Example:

> Radiohead → The Smile  
> Strong artist relationship

> Song A → Song B  
> Strong semantic similarity + playlist co-occurrence

---

# PHASE 4 — Generate Constellation Coordinates

## Objective

Convert the music relationships into spatial coordinates.

### Pipeline

```text
Music features
      ↓
Feature vectors
      ↓
Similarity / distance
      ↓
Clustering
      ↓
Dimensionality reduction
      ↓
X / Y / Z coordinates
```

### Explore suitable techniques

Start with:

- UMAP
- clustering such as HDBSCAN or another appropriate method

Do not assume one algorithm is automatically best. Compare results.

### Coordinate hierarchy

The system should eventually support:

```text
Universe
 └── Galaxy / Cluster
      └── Artist
           └── Album
                └── Song
```

### Important

The coordinates must come from the actual data.

Do not manually place artists to make the visualization look good.

### Acceptance criteria

Given the same dataset and configuration, the system can generate a reproducible set of coordinates and clusters.

Export the generated spatial data as JSON for the frontend.

---

# PHASE 5 — Build the 3D Universe

## Objective

Turn the generated coordinates into an interactive 3D experience.

Use a WebGL-based approach such as Three.js.

### Visual hierarchy

- Universe = complete music collection
- Galaxies = discovered clusters
- Stars/large nodes = artists
- Smaller nodes = songs
- Connections = meaningful relationships

### Required functionality

- 3D camera
- Zoom
- Pan/orbit
- Star/node rendering
- Connections
- Labels
- Smooth camera movement
- Basic lighting/depth
- Performance-conscious rendering

### Design principle

The visualization should feel like a universe, but the positions and relationships must remain data-driven.

Do not overload the screen with labels.

### Acceptance criteria

A real imported dataset produces a navigable 3D constellation.

---

# PHASE 6 — Deep Zoom Experience

## Objective

Make zooming the signature interaction.

The user should feel like they are travelling through their music.

### Navigation hierarchy

```text
FULL UNIVERSE
      ↓ zoom
GALAXY
      ↓ zoom
ARTIST
      ↓ zoom
ALBUM
      ↓ zoom
SONG
```

### Example

Zoom out:

> Your Music Universe

Zoom in:

> Alternative

Zoom in:

> Radiohead

Zoom in:

> In Rainbows

Zoom in:

> Weird Fishes

### Requirements

- Smooth camera transitions
- Dynamic level-of-detail
- Show/hide labels based on zoom
- Load additional details as needed
- Avoid rendering thousands of unnecessary objects at full detail

### Acceptance criteria

The user can continuously zoom from the universe level to an individual song without switching to a completely separate page.

---

# PHASE 7 — Interaction & Product Layer

## Objective

Turn the visualization into an actual usable product.

### Add

- Search
- Artist selection
- Song selection
- Hover states
- Detail panels
- Genre filters
- Playlist filters
- Timeline if temporal data is available
- Reset view
- Focus on artist
- Focus on song
- Show/hide connections
- 2D/3D toggle

### Artist panel

Should be able to show:

- Artist
- Number of songs
- Playlists containing the artist
- Related artists
- Related songs
- Relevant metadata

### Song panel

Should show:

- Song
- Artist
- Album
- Release information
- Related songs
- Why it is connected to nearby nodes

### Acceptance criteria

A user can explore their music without needing to understand the underlying data science.

---

# PHASE 8 — Real-World Music Import

## Objective

Remove the requirement for users to manually prepare CSV/JSON files.

### Apple Music

Investigate and implement the official/legitimate ways users can provide Apple Music data.

Possible routes to investigate:

- Apple Music data export
- Apple Music APIs
- Public playlist URLs
- Other officially supported mechanisms

Do not invent unsupported API capabilities.

### Spotify

Investigate current official API capabilities and permissions.

Implement account connection only where the required data is actually available.

### Keep CSV/JSON

Never remove the generic upload option.

It is useful for:

- testing
- unsupported platforms
- researchers
- power users

### Final architecture

```text
Apple Music ──┐
Spotify ──────┤
CSV ──────────┼──→ NORMALIZER
JSON ─────────┘          ↓
                  ENRICHMENT ENGINE
                         ↓
                  MUSIC INTELLIGENCE
                         ↓
                  SPATIAL ENGINE
                         ↓
                    3D UNIVERSE
```

---

# PHASE 9 — Compare Universes

## Objective

Allow two users to compare their musical worlds.

### Features

- Upload/connect User A
- Upload/connect User B
- Generate both universes
- Identify shared artists
- Identify shared songs
- Identify unique clusters
- Calculate musical overlap
- Find artists each person has not explored

### Killer feature

Generate a musical bridge:

> **Your Universe → Their Universe**

Recommend a path of artists/songs that gradually moves from one person's taste toward the other's.

---

# PHASE 10 — Sharing

## Objective

Make every constellation shareable.

### Generate

- Read-only public constellation
- Shareable URL
- Snapshot/image export
- Basic profile statistics

Example:

> 1,247 songs  
> 83 artists  
> 7 galaxies  
> 14 major clusters

### Privacy

Users must explicitly choose whether their constellation is public.

Do not expose raw playlist data by default.

---

# PHASE 11 — Polish & Performance

Only after the core system works.

### Optimize

- WebGL rendering
- Large datasets
- API calls
- Database queries
- Embedding generation
- Caching
- Lazy loading
- Mobile behavior

### Visual polish

- Cinematic background
- Subtle particle field
- Smooth transitions
- Atmospheric effects
- Typography
- Micro-interactions
- Loading states

Do not let visual polish hide weak data quality.

---

# PHASE 12 — Final Product Experience

## Landing page

> **Your music isn't a playlist.  
> It's a universe.**

CTA:

> **Create My Constellation**

### Import

```text
Connect music
      ↓
Analyzing your library...
      ↓
Mapping relationships...
      ↓
Building your universe...
```

### Result

The user enters their personalized 3D universe.

They can:

- explore
- zoom
- search
- discover relationships
- compare universes
- generate/share their constellation

---

# Non-Negotiable Technical Principles

## 1. No fake data in the real product

Demo data is acceptable during development.

It must never be presented as real user-generated analysis.

## 2. Data first, visuals second

Do not manually position stars.

## 3. Explain relationships

Whenever possible, tell the user why two things are connected.

## 4. Provider independence

Apple Music, Spotify, CSV and JSON should all eventually feed the same normalized schema.

## 5. Privacy by default

Music data is personal data.

Minimize what is stored and give users control over deletion and sharing.

## 6. Performance matters

The system must be designed for potentially thousands of tracks.

## 7. Don't overuse AI

Use ML/AI where it improves:

- semantic similarity
- clustering interpretation
- discovery
- explanations

Do not add an LLM simply because the project contains AI.

---

# Final Build Order

```text
PHASE 1
Data Import
   ↓
PHASE 2
Metadata Enrichment
   ↓
PHASE 3
Relationship Engine
   ↓
PHASE 4
Spatial / Coordinate Engine
   ↓
PHASE 5
3D Universe
   ↓
PHASE 6
Deep Zoom
   ↓
PHASE 7
Interaction
   ↓
PHASE 8
Apple / Spotify Integration
   ↓
PHASE 9
Compare Universes
   ↓
PHASE 10
Sharing
   ↓
PHASE 11
Performance + Polish
   ↓
PHASE 12
Final Product
```

# Definition of Success

The finished project should make someone say:

> **“I uploaded my music and it turned my taste into an actual universe.”**

Not:

> “Nice 3D dashboard.”

The first is a product.

The second is a frontend demo.

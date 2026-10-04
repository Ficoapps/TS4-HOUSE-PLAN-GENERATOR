# TS4 House Plan Generator

Browser app per generare **planimetrie residenziali arredate e ricostruibili in The Sims 4**, con distribuzione ispirata alle buone pratiche dell'architettura civile e resa grafica da planimetria tecnica/immobiliare.

> Versione attuale: **v0.4 – Professional Floorplan Engine**

## Caratteristiche

- Generazione automatica di planimetrie su griglia logica The Sims 4.
- Lotti da **20×15** fino a **64×64**.
- Da **1 a 4 piani**.
- Da **1 a 8 camere**.
- Forme: automatica, rettangolare, a L, a U e livelli sfalsati.
- Zonizzazione **giorno / notte / servizi**.
- Ingresso, corridoi e disimpegni reali.
- Vano scala coerente tra i piani.
- Bagni privati e cabine armadio.
- Studio, lavanderia e dispensa.
- Cucina separata oppure open space.
- Garage, balconi e terrazze.
- Patio / BBQ, piscina e giardino.
- Arredo 2D automatico.
- Sistema architettonico di **porte e aperture**: singole, doppie, scorrevoli, vani aperti e portone garage.
- **Finestre automatiche sulle pareti esterne**, dimensionate in base al locale.
- Finestre larghe per soggiorno/master, standard per camere/studio e schermate per bagni/lavanderia.
- Portefinestre/scorrevoli verso terrazze e spazi esterni quando coerenti con il layout.
- Pavimenti e materiali differenziati.
- Stili di rendering: **Tecnica**, **Immobiliare**, **Luxury**.
- Controlli di qualità distributiva, architettonica, grafica e compatibilità TS4.
- Generazione di varianti della stessa abitazione.
- Salvataggio locale nel browser.
- Esportazione **PNG HD**, **SVG** e **JSON**.
- Modalità **NO CC / Base Game friendly**.

## Avvio rapido

Non richiede installazione né server.

1. Scarica o clona il repository.
2. Apri `index.html` con Chrome, Edge o Firefox.
3. Su Windows puoi anche eseguire `AVVIA_TS4_HOUSE_GENERATOR.bat`.
4. Imposta lotto, stile, piani, camere e servizi.
5. Premi **Genera planimetria**.

## Struttura del progetto

```text
TS4-HOUSE-PLAN-GENERATOR/
├── index.html
├── style.css
├── engine.js
├── app.js
├── AVVIA_TS4_HOUSE_GENERATOR.bat
└── README.md
```

## Motore di progettazione

Il generatore cerca di applicare regole residenziali coerenti:

- zona giorno vicina all'ingresso;
- zona notte più riservata;
- camere sul perimetro quando possibile;
- cucina collegata alla zona pranzo;
- bagni e servizi organizzati in nuclei funzionali;
- corridoi e disimpegni continui;
- scale sovrapposte e coerenti tra i piani;
- accesso valido a ogni locale;
- nessun passaggio obbligato attraverso camere o bagni;
- proporzioni dei locali adattate alla griglia di The Sims 4.

## Rendering planimetrico

### Tecnica
Pianta pulita, muri leggibili, arredi schematici e massima chiarezza distributiva.

### Immobiliare
Pavimenti, arredi e presentazione più vicini alle planimetrie da brochure immobiliare.

### Luxury
Aggiunge maggiore enfasi visiva a giardino, acqua, patio e spazi esterni.

## Esportazioni

- **PNG HD**: immagine ad alta risoluzione della planimetria corrente.
- **SVG**: planimetria vettoriale modificabile.
- **JSON**: dati completi del progetto generato.

## Stato del progetto

La v0.4 è un **MVP avanzato**. Il progetto è in sviluppo attivo.

### Roadmap

- [ ] scale a L e a U;
- [ ] balconi e terrazze più evoluti;
- [ ] quote automatiche complete;
- [ ] legenda tecnica dettagliata;
- [x] più tipologie di porte e finestre;
- [ ] libreria arredi più ampia;
- [ ] controllo più rigoroso degli ingombri;
- [ ] migliore generazione di corti e patio;
- [ ] output dedicato alla costruzione passo-passo in The Sims 4;
- [ ] ricerca futura sull'esportazione verso i formati Tray di The Sims 4.

## Compatibilità

Testato per l'esecuzione locale nei browser desktop moderni. Non sono richiesti framework, dipendenze NPM o servizi esterni.

## Nota importante

TS4 House Plan Generator crea **concept planimetrici per The Sims 4**. Non è un software CAD/BIM e non produce elaborati validi per pratiche edilizie, calcoli strutturali o certificazioni di conformità normativa di edifici reali.

## Disclaimer

Questo progetto non è affiliato, sponsorizzato o approvato da Electronic Arts o Maxis. *The Sims* è un marchio dei rispettivi proprietari.


## Sviluppo successivo alla v0.4

Sul branch `main` è già presente un affinamento del motore aperture:

- riconoscimento delle pareti esterne;
- collegamenti porta fra locali adiacenti;
- ingresso principale dedicato;
- porte doppie per i principali passaggi della zona giorno;
- porte scorrevoli per cabine e accessi esterni;
- portone garage;
- finestre differenziate per funzione del locale;
- conteggio totale delle aperture nella scheda progetto.

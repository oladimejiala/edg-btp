# EDG BTP & SERVICES — Site vitrine

Site statique haute performance (HTML / CSS / JS natif — aucune dépendance à builder), prêt à déployer sur n'importe quel hébergement (Netlify, Vercel, GitHub Pages, cPanel/OVH, etc.).

## Structure
```
index.html        Page unique (sémantique HTML5, JSON-LD, meta SEO/AIEO)
css/styles.css     Design system (tokens, layout, responsive, animations)
js/main.js         Nav, scroll-reveal, compteurs, filtres portfolio, formulaire devis
js/chatbot.js      Assistant virtuel (déclenchement au scroll, flux guidé, relais WhatsApp)
robots.txt         Autorise l'indexation classique + crawlers IA (GPTBot, ClaudeBot, PerplexityBot…)
sitemap.xml        Plan du site
llms.txt           Résumé structuré pour les moteurs de réponse IA (AIEO)
```

## Avant mise en production

1. **Domaine réel** : remplacer `https://www.edgbtp-services.bj/` par le nom de domaine définitif dans `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` et `sitemap.xml`.
2. **Photos de chantier** : les visuels de portfolio sont actuellement des illustrations "plan technique" en CSS/SVG (aucune photo de stock utilisée). Remplacez les blocs `.project-media--0X` par de vraies photos de chantiers (formats `.webp`, 1200×800 recommandé) pour un rendu 100% photographique.
3. **Formulaire de devis** : `js/main.js` simule l'envoi. Connectez `#quoteForm` à un service réel (Formspree, EmailJS, ou une API interne) dans le bloc marqué `NOTE` du fichier.
4. **Mentions légales** : compléter le RCCM et l'IFU dans le footer (actuellement marqués `à compléter`).
5. **Numéro WhatsApp** : le numéro `+229 01 90 21 28 76` est utilisé pour le bouton d'appel, le chatbot et les liens `wa.me`. Vérifiez qu'il est actif sur WhatsApp Business.
6. **Lien Google Maps** : le lien fourni par le client est utilisé tel quel (footer, section avis, sidebar contact, JSON-LD `hasMap`).

## Notes techniques

- **Animations** : transitions et micro-interactions sont écrites en CSS + `IntersectionObserver` / Web Animations natif (pas de dépendance JS externe), pour un chargement instantané et zéro étape de build. `prefers-reduced-motion` est respecté partout.
- **Assistant IA** : `js/chatbot.js` détecte deux gestes de défilement distincts puis ouvre automatiquement la fenêtre de conversation. Le flux guidé collecte Nom/Fonction → Entreprise/Projet → Type de travaux (cases à cocher) → Contact WhatsApp, puis affiche l'état de succès et un lien `wa.me` pré-rempli avec le récapitulatif. Toute question hors flux bascule automatiquement vers un conseiller humain sur WhatsApp.
- **SEO / AIEO** : balises meta complètes, données structurées `GeneralContractor` + `FAQPage` (schema.org), `llms.txt`, et `robots.txt` ouvert aux crawlers des principaux moteurs de réponse IA (ChatGPT, Claude, Perplexity, Gemini/Google-Extended).
- **Accessibilité** : lien d'évitement, focus visible, contrastes AA sur fond navy, labels de formulaire explicites.

## Déploiement rapide

Glissez-déposez le dossier sur Netlify Drop, ou :
```bash
# Exemple avec un serveur statique local pour tester
npx serve .
```

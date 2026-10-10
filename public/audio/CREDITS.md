# Sons et voix de L’Arène

28 fichiers OGG sont inclus dans le jeu. Aucun enregistrement, musique, voix
ou modèle de personnage de la série Squid Game n’est utilisé.

## Voix françaises — CC BY 4.0

Voix neuronale **Piper fr_FR-siwis-medium**, modèle entraîné par le projet
Rhasspy/Piper à partir du corpus **SIWIS French Speech Synthesis Database**,
Université d’Édimbourg (2017), Junichi Yamagishi, Pierre-Edouard Honnet,
Alexandros Lazaridis, Philip N. Garner.

- Corpus et attribution : https://datashare.is.ed.ac.uk/handle/10283/2353
- Modèle source : https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/siwis/medium
- Copie du modèle utilisée pour la génération : https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models
- Licence du corpus, indiquée par la fiche du modèle : **Creative Commons Attribution 4.0 International** — https://creativecommons.org/licenses/by/4.0/
- La fiche du modèle est conservée dans SIWIS_MODEL_CARD.md.

Les textes ont été écrits pour ce jeu. La comptine « Un, deux, trois, soleil »
a été synthétisée mot par mot, transposée sur quatre notes originales et
étirée avec FFmpeg/Rubber Band. Les autres annonces, exclamations de panique
et « Ah ! » sont des voix de synthèse. Ce ne sont pas des performances
humaines enregistrées ni des imitations d’un acteur de la série.
Les fichiers vocaux sont distribués sous **CC BY 4.0**, avec cette attribution.
Le modèle et le moteur Piper ne sont pas distribués dans l’application.

## Musique et bruitages — CC0 1.0

« Cour des silences » : composition originale de 16 secondes, nappe mineure,
pulsations graves et notes de verre désaccordées. Jingles de victoire et de
défaite originaux. Tirs, impacts, chute de corps, pas de sable/pierre/métal,
verre, corde, billes, biscuit, souffle de lancer et respiration : création
originale par synthèse, filtrage et superposition de bruits et de résonances.
Aucun échantillon provenant d’une banque commerciale n’est utilisé.
Ces créations sont mises à disposition sous **CC0 1.0** :
https://creativecommons.org/publicdomain/zero/1.0/

Le script scripts/generate-audio.py décrit leur création. Le fichier
manifest.json décrit chaque son et sa durée. La génération est un outil de
développement ; jouer ne nécessite ni Python, ni modèle vocal, ni service TTS.

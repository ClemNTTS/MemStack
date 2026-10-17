import { useId } from 'react'

export default function EnterpriseOfferFilm() {
  const captionId = useId()
  const videoPath = `${import.meta.env.BASE_URL}enterprise/video/memstack-entreprise`

  return <figure className="enterprise-offer-film">
    <video
      controls
      playsInline
      preload="none"
      width="1920"
      height="1080"
      poster={`${videoPath}-poster.webp`}
      aria-label="Présentation de MemStack Entreprise en 48 secondes"
      aria-describedby={captionId}
    >
      <source src={`${videoPath}.mp4`} type="video/mp4" />
      <source src={`${videoPath}.webm`} type="video/webm" />
      <track kind="captions" src={`${videoPath}.fr.vtt`} srcLang="fr" label="Français · voix off" />
      <a href={`${videoPath}.mp4`}>Télécharger la présentation vidéo</a>
    </video>
    <figcaption id={captionId}>
      <strong>L’offre Entreprise en 48 secondes.</strong>
      <span>Avec Mémo · voix française et sous-titres.</span>
    </figcaption>
    <details className="enterprise-offer-film-transcript">
      <summary>Lire la présentation</summary>
      <p>Votre équipe a des idées. Donnez-leur une méthode. Avec MemStack Entreprise, apprenez à mieux utiliser les assistants IA, à organiser vos automatisations et à faire avancer vos projets numériques.</p>
      <p>Les parcours proposent des cas fictifs, un livrable à préparer et un exemple expliqué. Les révisions entretiennent les acquis et les repères d’équipe accompagnent la progression. Mémo guide la découverte, la pratique et la réussite collective.</p>
      <p>Faites de l’IA une compétence collective.</p>
      <a href={`${videoPath}.mp4`} download>Télécharger le film</a>
      {' · '}<a href={`${import.meta.env.BASE_URL}enterprise/video/CREDITS.txt`}>Crédits audio</a>
    </details>
  </figure>
}

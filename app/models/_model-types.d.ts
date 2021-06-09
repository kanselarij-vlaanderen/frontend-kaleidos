
import { ManyArray } from '@ember/data';


type PublicationFlow = {
  publicationSubcase: PublicationSubcase
}

type PublicationSubcase = {
  proofingActivities: ManyArray<ProofingActitivy>
}

type ProofingActitivy = {
  usedPieces: {

  },
  generatedPieces: ManyArray<Piece>
}

type Piece = {

}

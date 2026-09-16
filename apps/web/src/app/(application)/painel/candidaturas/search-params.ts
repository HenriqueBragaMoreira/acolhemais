import { createSerializer, parseAsString } from 'nuqs'

/** O estado das candidaturas na URL: o animal do filtro. */
export const boardParams = { animal: parseAsString }

/** O endereço das candidaturas com este filtro, para links ("2 candidaturas ativas"). */
export const boardHref = createSerializer(boardParams)

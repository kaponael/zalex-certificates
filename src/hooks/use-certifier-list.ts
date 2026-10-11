"use client"

import { useSyncExternalStore } from "react"
import {
  getSavedCertifiersJson,
  getCertifiersFromJson,
  listenForCertifierChanges,
} from "@/lib/certifier-storage"

function getInitialSavedData() {
  return null
}

export function useCertifierList() {
  const savedJson = useSyncExternalStore(
    listenForCertifierChanges,
    getSavedCertifiersJson,
    getInitialSavedData
  )
  const certifiers = getCertifiersFromJson(savedJson)
  const certifierNames = certifiers
    .filter((person) => person.isActive)
    .map((person) => person.name)
  const isLoading = savedJson === null

  return { certifiers, certifierNames, isLoading }
}

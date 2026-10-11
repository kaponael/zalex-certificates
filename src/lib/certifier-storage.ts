import type { Certifier } from "@/types/certifier"

const certifiersStorageKey = "zalex-certificates:certifiers"
const certifiersUpdatedEvent = "zalex-certificates:certifiers-updated"
const defaultCertifiers: Certifier[] = [
  { name: "John Doe", isActive: true },
  { name: "Jane Doe", isActive: true },
]
const defaultCertifiersJson = JSON.stringify(defaultCertifiers)

export function getSavedCertifiersJson(): string | null {
  if (typeof window === "undefined") return null

  try {
    return window.localStorage.getItem(certifiersStorageKey) ?? defaultCertifiersJson
  } catch {
    return defaultCertifiersJson
  }
}

export function getCertifiersFromJson(savedJson: string | null): Certifier[] {
  if (savedJson === null) return []

  try {
    const savedCertifiers: unknown = JSON.parse(savedJson)
    if (!Array.isArray(savedCertifiers)) return [...defaultCertifiers]

    const certifiers: Certifier[] = []
    for (const savedPerson of savedCertifiers) {
      const person: unknown = savedPerson
      let certifier: Certifier
      if (typeof person === "string" && person.trim() !== "") {
        certifier = { name: person, isActive: true }
      } else if (
        typeof person === "object" && person !== null &&
        "name" in person && "isActive" in person &&
        typeof person.name === "string" && person.name.trim() !== "" &&
        typeof person.isActive === "boolean"
      ) {
        certifier = { name: person.name, isActive: person.isActive }
      } else {
        return [...defaultCertifiers]
      }

      if (!certifiers.some((existing) => existing.name === certifier.name)) {
        certifiers.push(certifier)
      }
    }

    return certifiers
  } catch {
  }

  return [...defaultCertifiers]
}

export function loadCertifiers(): Certifier[] {
  const savedJson = getSavedCertifiersJson()
  return getCertifiersFromJson(savedJson)
}

export function loadActiveCertifierNames(): string[] {
  return loadCertifiers().filter((person) => person.isActive).map((person) => person.name)
}

export function listenForCertifierChanges(updateList: () => void) {
  function handleStorageChange(event: StorageEvent) {
    if (event.key === certifiersStorageKey || event.key === null) updateList()
  }

  window.addEventListener("storage", handleStorageChange)
  window.addEventListener(certifiersUpdatedEvent, updateList)

  return () => {
    window.removeEventListener("storage", handleStorageChange)
    window.removeEventListener(certifiersUpdatedEvent, updateList)
  }
}

function saveCertifiers(certifiers: Certifier[]): string | undefined {
  try {
    window.localStorage.setItem(certifiersStorageKey, JSON.stringify(certifiers))
    window.dispatchEvent(new Event(certifiersUpdatedEvent))
    return undefined
  } catch {
    return "Unable to save certifiers. Allow browser storage and try again."
  }
}

export function checkCertifierName(value: string): string | undefined {
  const name = value.trim().replace(/\s+/g, " ").normalize("NFC")
  if (!name) return "Enter a name."

  const certifiers = loadCertifiers()
  for (const person of certifiers) {
    if (person.name.toLowerCase() === name.toLowerCase()) {
      return "This person is already in the list."
    }
  }

  return undefined
}

export function addCertifier(value: string): string | undefined {
  const errorMessage = checkCertifierName(value)
  if (errorMessage) return errorMessage

  const name = value.trim().replace(/\s+/g, " ").normalize("NFC")
  const certifiers = loadCertifiers()
  const updatedCertifiers = [...certifiers, { name, isActive: true }]
  return saveCertifiers(updatedCertifiers)
}

export function removeCertifier(name: string): string | undefined {
  const certifiers = loadCertifiers()
  if (!certifiers.some((person) => person.name === name)) {
    return "This certifier has already been deleted."
  }
  const remainingCertifiers = certifiers.filter((person) => person.name !== name)
  return saveCertifiers(remainingCertifiers)
}
export function setCertifierActive(name: string, isActive: boolean): string | undefined {
  const certifiers = loadCertifiers()
  if (!certifiers.some((person) => person.name === name)) {
    return "This certifier is no longer in the list."
  }

  const updatedCertifiers = certifiers.map((person) => {
    if (person.name === name) return { ...person, isActive }
    return person
  })
  return saveCertifiers(updatedCertifiers)
}

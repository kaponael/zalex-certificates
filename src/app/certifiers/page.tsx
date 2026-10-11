"use client"

import { useRef, useState, type FormEvent } from "react"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon, UserCheckIcon, UserXIcon } from "lucide-react"
import { FormInput } from "@/components/form-fields"
import { ListFilter } from "@/components/list-filter"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useCertifierList } from "@/hooks/use-certifier-list"
import { cn } from "@/lib/utils"
import {
  addCertifier,
  checkCertifierName,
  removeCertifier,
  setCertifierActive,
} from "@/lib/certifier-storage"

type CertifierAction = "add" | "activate" | "deactivate" | "delete"

const actionDetails = {
  add: { label: "Add", description: "This person will be available in the Certified by dropdown." },
  activate: { label: "Activate", description: "This person will be available in the Certified by dropdown again." },
  deactivate: { label: "Deactivate", description: "This person will stay in this list but will be hidden from the Certified by dropdown. Existing requests will keep their assigned name." },
  delete: { label: "Delete", description: "This person will be removed from this list. Existing requests will keep their assigned name." },
}

const iconButtonClass = "inline-flex size-9 shrink-0 items-center justify-center bg-transparent text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"

export default function CertifiersPage() {
  const { certifiers, isLoading } = useCertifierList()
  const [newCertifierName, setNewCertifierName] = useState("")
  const [error, setError] = useState<string>()
  const [nameFilter, setNameFilter] = useState("")
  const [sortActiveFirst, setSortActiveFirst] = useState(true)
  const [pendingAction, setPendingAction] = useState<{
    type: CertifierAction
    name: string
  } | null>(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const actionButton = useRef<HTMLElement | null>(null)

  const searchName = nameFilter.trim().toLowerCase()
  const filteredCertifiers = certifiers.filter((person) =>
    person.name.toLowerCase().includes(searchName)
  )

  const sortedCertifiers = [...filteredCertifiers].sort((first, second) => {
    if (first.isActive === second.isActive) return 0
    if (sortActiveFirst) return first.isActive ? -1 : 1
    return first.isActive ? 1 : -1
  })

  function openConfirmation(type: CertifierAction, name: string) {
    actionButton.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    setPendingAction({ type, name })
    setIsConfirmationOpen(true)
  }

  function handleAddCertifier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errorMessage = checkCertifierName(newCertifierName)
    setError(errorMessage)
    if (errorMessage) return

    openConfirmation("add", newCertifierName.trim())
  }

  function confirmAction() {
    if (!pendingAction) return
    const { type, name } = pendingAction
    let errorMessage: string | undefined

    if (type === "add") {
      errorMessage = addCertifier(name)
    } else if (type === "delete") {
      errorMessage = removeCertifier(name)
    } else {
      errorMessage = setCertifierActive(name, type === "activate")
    }

    if (errorMessage) {
      toast.add({ title: errorMessage, type: "error" })
      return
    }

    if (type === "add") setNewCertifierName("")
    setIsConfirmationOpen(false)
    const successMessages = {
      add: `${name} added.`,
      activate: `${name} activated.`,
      deactivate: `${name} deactivated.`,
      delete: `${name} deleted.`,
    }
    toast.add({ title: successMessages[type], type: "success" })
  }

  return (
    <>
      <PageHeader title="Certifiers" />
      <section className="flex-1 p-6">
        <div className="mx-auto w-full max-w-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Manage certifiers</h2>
            <p className="text-sm text-muted-foreground">
              Add the people who can be selected under Certified by when requesting a certificate.
              Deactivate someone to hide them from the dropdown, or delete them from this list.
            </p>
          </div>

          <form
            onSubmit={handleAddCertifier}
            noValidate
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2"
          >
            <FormInput
              ref={nameInput}
              id="certifierName"
              name="certifierName"
              label="Full name"
              placeholder="Enter a person's name"
              value={newCertifierName}
              onChange={(event) => {
                setNewCertifierName(event.currentTarget.value)
                setError(undefined)
              }}
              error={error}
              autoComplete="off"
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={cn(iconButtonClass, "mt-7")}
              aria-label="Add certifier"
              title="Add certifier"
            >
              <PlusIcon className="size-5" aria-hidden="true" />
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="font-semibold">All certifiers ({certifiers.length})</h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1 basis-48">
                <ListFilter
                  label="Filter certifiers"
                  placeholder="Filter by name"
                  value={nameFilter}
                  onValueChange={setNameFilter}
                >
                  <span className="text-xs">Name</span>
                </ListFilter>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  Status: {sortActiveFirst ? "Active first" : "Inactive first"}
                </span>
                <button
                  type="button"
                  className={iconButtonClass}
                  aria-label={`Sort by status: show ${sortActiveFirst ? "inactive" : "active"} certifiers first`}
                  title={`Show ${sortActiveFirst ? "inactive" : "active"} first`}
                  onClick={() => setSortActiveFirst(!sortActiveFirst)}
                >
                  {sortActiveFirst ? (
                    <ArrowUpIcon className="size-4" aria-hidden="true" />
                  ) : (
                    <ArrowDownIcon className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            {isLoading ? (
              <p role="status" className="text-sm text-muted-foreground">Loading certifiers...</p>
            ) : certifiers.length === 0 ? (
              <p className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No certifiers yet. Add a person above to make them available in the request form.
              </p>
            ) : sortedCertifiers.length === 0 ? (
              <p role="status" className="rounded-2xl border p-4 text-sm text-muted-foreground">
                No certifiers match this name.
              </p>
            ) : (
              <ul className="divide-y overflow-hidden rounded-2xl border">
                {sortedCertifiers.map((person) => (
                  <li key={person.name} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="break-words">{person.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {person.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        className={cn(
                          iconButtonClass,
                          person.isActive
                            ? "text-destructive hover:text-destructive/80"
                            : "text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        )}
                        aria-label={`${person.isActive ? "Deactivate" : "Activate"} ${person.name}`}
                        title={person.isActive ? "Deactivate" : "Activate"}
                        onClick={() => openConfirmation(person.isActive ? "deactivate" : "activate", person.name)}
                      >
                        {person.isActive ? (
                          <UserXIcon className="size-5" aria-hidden="true" />
                        ) : (
                          <UserCheckIcon className="size-5" aria-hidden="true" />
                        )}
                      </button>
                      <button
                        type="button"
                        className={cn(iconButtonClass, "hover:text-destructive")}
                        aria-label={`Delete ${person.name}`}
                        title="Delete"
                        onClick={() => openConfirmation("delete", person.name)}
                      >
                        <Trash2Icon className="size-5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <AlertDialog.Root
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onOpenChangeComplete={(open) => {
          if (!open) setPendingAction(null)
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
          <AlertDialog.Popup
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-xl"
            initialFocus={cancelButton}
            finalFocus={() => actionButton.current?.isConnected ? actionButton.current : nameInput.current}
          >
            <AlertDialog.Title className="text-lg font-semibold">
              {pendingAction ? `${actionDetails[pendingAction.type].label} certifier?` : "Confirm action"}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground">
              {pendingAction && (
                <>
                  <span className="mb-2 block break-words font-medium text-foreground">{pendingAction.name}</span>
                  {actionDetails[pendingAction.type].description}
                </>
              )}
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Close render={<Button ref={cancelButton} type="button" variant="outline" className="px-4" />}>
                Cancel
              </AlertDialog.Close>
              <Button
                type="button"
                className="px-4"
                variant={pendingAction?.type === "delete" ? "destructive" : "default"}
                onClick={confirmAction}
              >
                {pendingAction ? actionDetails[pendingAction.type].label : "Confirm"}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}

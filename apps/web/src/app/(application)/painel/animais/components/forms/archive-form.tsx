'use client'

import { Button } from '@acolhemais/ui/components/button'
import { DialogClose } from '@acolhemais/ui/components/dialog'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { TextField } from '@/components/text-field'
import { panelServices } from '@/services/panel'

const schema = z.object({
  reason: z.string().trim().min(1, 'reasonRequired').max(500, 'tooLong'),
})

/** Arquivar com motivo (FR-030): óbito, transferência; cancela as candidaturas ativas (BR-078). */
export function ArchiveForm({ animalId, onDone }: { animalId: string; onDone: () => void }) {
  const t = useTranslations('Panel.animalStatus.archive')
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await authClient.getSession()
      if (response.error) throw response.error

      return response.data
    },
  })
  const by = session?.user.name ?? ''
  const queryClient = useQueryClient()
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { reason: '' } })

  const archive = useMutation({
    mutationFn: ({ reason }: z.infer<typeof schema>) =>
      panelServices.changeAnimalStatus(animalId, 'archived', by, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['panel'] })
      onDone()
    },
  })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => archive.mutate(data))} className="mt-6">
      <TextField
        control={form.control}
        name="reason"
        label={t('reason')}
        description={t('reasonHint')}
      />
      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <DialogClose render={<Button variant="outline" />}>{t('cancel')}</DialogClose>
        <Button
          type="submit"
          variant="destructive"
          disabled={archive.isPending}
          aria-busy={archive.isPending}
        >
          {archive.isPending && <Spinner />}
          {t('submit')}
        </Button>
      </div>
    </form>
  )
}

'use client'

import { Button } from '@acolhemais/ui/components/button'
import { DialogClose } from '@acolhemais/ui/components/dialog'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authServices } from '@/services/auth'
import { TextField } from '@/components/text-field'
import { panelServices } from '@/services/panel'

const schema = z.object({
  message: z.string().trim().min(1, 'messageRequired').max(1000, 'tooLong'),
})

/** Pede uma informação: a candidatura fica "aguardando o adotante", na mesma etapa (BR-076). */
export function RequestInfoForm({
  applicationId,
  applicantName,
  onDone,
}: {
  applicationId: string
  applicantName: string
  onDone: () => void
}) {
  const t = useTranslations('Panel.file.requestInfo')
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: () => authServices.session(),
  })
  const by = session?.user.name ?? ''
  const queryClient = useQueryClient()
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { message: '' } })

  const send = useMutation({
    mutationFn: ({ message }: z.infer<typeof schema>) =>
      panelServices.requestInfo(applicationId, message, by),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['panel'] })
      onDone()
    },
  })

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => send.mutate(data))} className="mt-6">
      <TextField
        control={form.control}
        name="message"
        label={t('message', { name: applicantName })}
        description={t('messageHint')}
        multiline
      />
      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <DialogClose render={<Button variant="outline" />}>{t('cancel')}</DialogClose>
        <Button type="submit" disabled={send.isPending} aria-busy={send.isPending}>
          {send.isPending && <Spinner />}
          {send.isPending ? t('sending') : t('submit')}
        </Button>
      </div>
    </form>
  )
}

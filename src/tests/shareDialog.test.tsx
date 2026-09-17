import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShareResultsDialog } from '../components/ShareResultsDialog'
import { calculateTraitScores } from '../engine/discoveryScoring'
import { evaluateReadiness } from '../engine/readinessScoring'
import { matchRoles } from '../engine/roleMatching'
import type { ShareResultsData } from '../engine/shareResults'

const answers = { 'd-power-give': 'strong', 'd-position-give': 'strong', 'r-lead': 'strong', 'r-responsibility': 'strong' }
const data: ShareResultsData = {
  roleResults: matchRoles(calculateTraitScores(answers), answers),
  readiness: evaluateReadiness({ 'c-ongoing-1': 'c' }),
  boundaries: { power: 'love' },
  negotiation: { 'n-planning': 'p1' },
}
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

function mockImageExport() {
  const gradient = { addColorStop: vi.fn() }
  const context = {
    fillStyle: '', strokeStyle: '', lineWidth: 0, font: '',
    fillRect: vi.fn(), createRadialGradient: vi.fn(() => gradient), beginPath: vi.fn(), arc: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), fillText: vi.fn(),
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['local image'], { type: 'image/png' })))
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:local-card') })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
  return vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
  Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined })
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectURL })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectURL })
})

describe('Export & Share dialog', () => {
  it('starts with the top five role cards selected and labelled', () => {
    render(<ShareResultsDialog data={data} onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: /role cards/i })).toHaveAttribute('aria-pressed', 'true')
    const roleChoices = within(screen.getByRole('group', { name: 'Roles to export' })).getAllByRole('checkbox')
    expect(roleChoices).toHaveLength(5)
    roleChoices.forEach((choice) => expect(choice).toBeChecked())
    expect(screen.getByText('5 of 5 roles selected')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /include confidence on overview card/i })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Export 5 cards' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Share 5 cards' })).toBeEnabled()
  })

  it('supports clear all, individual selection, and select all', () => {
    render(<ShareResultsDialog data={data} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.getByText('0 of 5 roles selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export 0 cards' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Share 0 cards' })).toBeDisabled()

    fireEvent.click(within(screen.getByRole('group', { name: 'Roles to export' })).getAllByRole('checkbox')[0])
    expect(screen.getByText('1 of 5 roles selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export card' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Share card' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Select all' }))
    expect(screen.getByText('5 of 5 roles selected')).toBeInTheDocument()
  })

  it('keeps Quick Summary role-only and copies it with explicit feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { container } = render(<ShareResultsDialog data={data} onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /quick summary/i }))
    const preview = container.querySelector('.share-preview pre')!
    expect(preview).not.toHaveTextContent('Readiness reflection')
    expect(preview).not.toHaveTextContent('Wants & boundaries')
    expect(preview).not.toHaveTextContent('Negotiation preferences')
    fireEvent.click(screen.getByRole('button', { name: 'Copy Quick Summary' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
    expect(screen.getByRole('status')).toHaveTextContent('Summary copied.')
  })

  it('keeps sensitive Full Reflection options off until selected', () => {
    const { container } = render(<ShareResultsDialog data={data} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /full reflection/i }))

    expect(screen.getByRole('checkbox', { name: /top role results/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /alignment labels/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /^confidence/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /^reflection/i })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /potential blind spots/i })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /wants & boundaries/i })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /negotiation preferences/i })).not.toBeChecked()

    fireEvent.click(screen.getByRole('checkbox', { name: /wants & boundaries/i }))
    const preview = container.querySelector('.share-preview pre')!
    expect(preview).toHaveTextContent('Wants & boundaries')
    expect(screen.getAllByText(/boundaries shown here reflect the selections made/i).length).toBeGreaterThan(0)
  })

  it('announces single-card export and native-share fallback outcomes', async () => {
    const click = mockImageExport()
    render(<ShareResultsDialog data={data} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    fireEvent.click(within(screen.getByRole('group', { name: 'Roles to export' })).getAllByRole('checkbox')[0])

    fireEvent.click(screen.getByRole('button', { name: 'Export card' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Card exported.'))
    fireEvent.click(screen.getByRole('button', { name: 'Share card' }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/cards were exported instead/i))
    expect(click).toHaveBeenCalledTimes(2)
  })

  it('closes with Escape and initially moves focus into the dialog', () => {
    const onClose = vi.fn()
    render(<ShareResultsDialog data={data} onClose={onClose} />)

    expect(screen.getByRole('button', { name: /close export and sharing dialog/i })).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})

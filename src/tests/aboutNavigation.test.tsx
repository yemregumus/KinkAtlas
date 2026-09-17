import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AboutPage } from '../pages/AboutPage'

const expectedSections = [
  ['What it does', '#what-it-does'],
  ['How it works', '#how-it-works'],
  ['Different questions, separate answers', '#different-questions'],
  ['Why it was built', '#why-it-exists'],
  ['What it does not do', '#what-it-does-not-do'],
  ['Privacy & transparency', '#privacy'],
  ['Role-definition methodology', '#definitions'],
  ['Limitations', '#limitations'],
]

function renderAbout(entry = '/about') {
  return render(<MemoryRouter initialEntries={[entry]}><AboutPage /></MemoryRouter>)
}

afterEach(cleanup)

describe('About contents navigation', () => {
  it('starts as one horizontal contents navigation with the expected anchors', () => {
    renderAbout()

    const navigation = screen.getByRole('navigation', { name: 'About sections' })
    expect(navigation).not.toHaveClass('is-docked')
    expect(navigation.parentElement).not.toHaveClass('is-contents-docked')
    expect(screen.getAllByRole('navigation', { name: 'About sections' })).toHaveLength(1)
    for (const [label, href] of expectedSections) expect(within(navigation).getByRole('link', { name: label })).toHaveAttribute('href', href)
  })

  it('docks the same navigation and marks the clicked section active', () => {
    renderAbout()

    const navigation = screen.getByRole('navigation', { name: 'About sections' })
    fireEvent.click(within(navigation).getByRole('link', { name: 'Privacy & transparency' }))

    expect(navigation).toHaveClass('is-docked')
    expect(navigation.parentElement).toHaveClass('is-contents-docked')
    expect(within(navigation).getByRole('link', { name: 'Privacy & transparency' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getAllByRole('navigation', { name: 'About sections' })).toHaveLength(1)
  })

  it('initializes a valid direct hash in its docked, active state', () => {
    renderAbout('/about#definitions')

    const navigation = screen.getByRole('navigation', { name: 'About sections' })
    expect(navigation).toHaveClass('is-docked')
    expect(within(navigation).getByRole('link', { name: 'Role-definition methodology' })).toHaveAttribute('aria-current', 'location')
  })

  it('keeps the same real anchor navigation available after docking', () => {
    renderAbout()

    const navigation = screen.getByRole('navigation', { name: 'About sections' })
    fireEvent.click(within(navigation).getByRole('link', { name: 'How it works' }))
    for (const [label, href] of expectedSections) expect(within(navigation).getByRole('link', { name: label })).toHaveAttribute('href', href)
    expect(screen.getByRole('region', { name: 'How it works' })).toHaveTextContent('deterministic, rules-based assessment')
  })
})

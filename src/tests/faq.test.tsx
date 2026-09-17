import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { FaqPage } from '../pages/FaqPage'

afterEach(() => cleanup())

describe('public FAQ and footer', () => {
  it('renders the FAQ route with native accessible disclosures and core explanations', () => {
    const { container } = render(<MemoryRouter><FaqPage /></MemoryRouter>)
    const disclosures = container.querySelectorAll('summary')
    expect(disclosures).toHaveLength(16)
    for (const question of ['What is KinkAtlas?', 'How does KinkAtlas work?', 'Does KinkAtlas use AI to generate my results?', 'Are my answers stored?', 'Why might I get fewer than five suggested roles?', 'What do Alignment and Confidence mean?', 'What does Evidence breadth mean?', 'Do boundaries affect my role results?', 'Does a suggested role mean I should identify with it?', 'Does a role imply consent?', 'Can I add roles manually?', 'Can I leave my role set empty?', 'What is Reflection?', 'What are Potential blind spots?', 'Are these results a safety assessment?', 'Why can two people use the same role label differently?']) expect(screen.getByText(question)).toBeInTheDocument()
    expect(screen.getByText('Generative AI does not analyze your answers or generate your results.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Read How it works' })).toHaveAttribute('href', '/about#how-it-works')
  })

  it('exposes the FAQ footer link and requested three-row footer content', () => {
    window.history.replaceState(null, '', '/faq')
    render(<App />)
    const footer = screen.getByRole('contentinfo')
    const navigation = within(footer).getByRole('navigation', { name: 'Further information' })
    for (const label of ['How it works', 'Privacy', 'FAQ', 'Contact', 'Consent philosophy']) expect(within(navigation).getByRole('link', { name: label })).toBeInTheDocument()
    expect(within(footer).getByText('Built by D.')).toBeInTheDocument()
    expect(within(footer).getByText(`© ${new Date().getFullYear()} KinkAtlas. All Rights Reserved.`)).toBeInTheDocument()
    expect(within(navigation).getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq')
    expect(within(navigation).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })
})

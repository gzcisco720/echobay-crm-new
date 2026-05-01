import {
  tab1Schema,
  tab2Schema,
  tab3Schema,
  tab4Schema,
  tab5Schema,
  tab6Schema,
} from '@/lib/validations/application.schema'

describe('tab1Schema (Company Info)', () => {
  it('accepts valid company info', () => {
    const r = tab1Schema.safeParse({
      registeredCompanyName: 'Acme Pty Ltd',
      acn: '123456789',
      abn: '12345678901',
      registeredAddress: '1 Main St Sydney',
      sameAsRegistered: true,
      countryOfIncorporation: 'Australia',
    })
    expect(r.success).toBe(true)
  })

  it('rejects missing registeredCompanyName', () => {
    const r = tab1Schema.safeParse({ acn: '1', abn: '1', registeredAddress: 'x' })
    expect(r.success).toBe(false)
  })
})

describe('tab2Schema (Contacts)', () => {
  const base = {
    primaryContact: { name: 'Jane', email: 'jane@co.com', phone: '0411000000' },
    isAuthorizedSignatory: true,
    financeContact: { name: 'Bob', position: 'CFO', email: 'bob@co.com', phone: '0422000000' },
  }

  it('accepts valid contacts without authorized director', () => {
    expect(tab2Schema.safeParse(base).success).toBe(true)
  })

  it('rejects missing financeContact', () => {
    const { financeContact: _fc, ...noFinance } = base
    expect(tab2Schema.safeParse(noFinance).success).toBe(false)
  })
})

describe('tab4Schema (Banking)', () => {
  it('accepts valid bank details', () => {
    const r = tab4Schema.safeParse({
      bankAccountName: 'Acme Pty Ltd',
      bankAccountNumber: '12345678',
      bankName: 'CBA',
      bankBsb: '062-000',
    })
    expect(r.success).toBe(true)
  })
})

describe('tab6Schema (Agreement)', () => {
  const valid = {
    password: 'SecurePass1!',
    confirmPassword: 'SecurePass1!',
    agreementAccepted: true,
    setupFeeAccepted: true,
    applicantSignature: 'Jane Smith',
    applicantName: 'Jane Smith',
    applicantPosition: 'Director',
    applicantDate: '2026-04-25',
    witnessSignature: 'Bob Jones',
    witnessName: 'Bob Jones',
    witnessDate: '2026-04-25',
  }

  it('accepts valid agreement data', () => {
    expect(tab6Schema.safeParse(valid).success).toBe(true)
  })

  it('rejects when passwords do not match', () => {
    const r = tab6Schema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(r.success).toBe(false)
  })

  it('rejects when agreementAccepted is false', () => {
    const r = tab6Schema.safeParse({ ...valid, agreementAccepted: false })
    expect(r.success).toBe(false)
  })
})

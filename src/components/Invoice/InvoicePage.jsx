import React, { useState, useMemo } from 'react';
import '../../styles/theme.css';
import './InvoicePage.css';

// Helper: number to words (handles up to billions)
function convertNumberToWords(num) {
  if (num === 0) return 'zero';
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }

  return inWords(num);
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function InvoicePage() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [billingFromDate, setBillingFromDate] = useState(todayISO());
  const [billingToDate, setBillingToDate] = useState(todayISO());
  const [coachingSessions, setCoachingSessions] = useState(0);
  const [coachingRate, setCoachingRate] = useState(0);
  const [tournamentAmount, setTournamentAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [tournamentTitle, setTournamentTitle] = useState('Tournament Day');

  const coachingAmount = useMemo(() => Number(coachingSessions) * Number(coachingRate), [coachingSessions, coachingRate]);
  const totalAmount = useMemo(() => Number(coachingAmount) + Number(tournamentAmount), [coachingAmount, tournamentAmount]);
  const amountInWords = useMemo(() => {
    const words = convertNumberToWords(Number(totalAmount));
    if (!words) return '';
    // Capitalize first letter
    return words.replace(/^[a-z]/, (m) => m.toUpperCase());
  }, [totalAmount]);

  const formatNumber = (n) => Number(n).toLocaleString();

  const handlePrint = () => {
    const payload = {
      invoiceNumber,
      invoiceDate,
      billingPeriod: { from: billingFromDate, to: billingToDate },
      lineItems: [
        { description: 'Archery coaching', sessions: Number(coachingSessions), rate: Number(coachingRate), amount: Number(coachingAmount) },
        { description: 'Tournament Day', amount: Number(tournamentAmount) }
      ],
      totalAmount: Number(totalAmount),
      amountInWords,
      notes
    };
    console.log(JSON.stringify(payload, null, 2));
    // print only invoice content
    window.print();
  };

  return (
    <div className="invoice-page">
      <div className="invoice-card">
        <header className="invoice-header">
          <h1 className="invoice-title">BAFL Foundation</h1>
          <div className="invoice-address">
            FLC/5 Siddhivinayak Vihars No 72/2E, Hadapsar,
            <br />Pune, 411028 Maharashtra, India
          </div>
        </header>

        <section className="invoice-meta">
          <div className="invoice-meta__left">
            <label className="invoice-label">Invoice No:</label>
            <input className="invoice-input" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
          <div className="invoice-meta__right">
            <label className="invoice-label">Date:</label>
            <input className="invoice-input" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
        </section>

        <section className="invoice-billing">
          <div className="invoice-billed-to">
            <label className="invoice-label">Billed To:</label>
            <div className="invoice-static"> 
Avasara Academy
 Lavale, Bavdhan, Pune
 Maharashtra, India, 411055</div>
          </div>

          <div className="invoice-period">
            <label className="invoice-label">Period of billing:</label>
            <div className="invoice-period__fields">
              <input type="date" className="invoice-input" value={billingFromDate} onChange={(e) => setBillingFromDate(e.target.value)} />
              <input type="date" className="invoice-input" value={billingToDate} onChange={(e) => setBillingToDate(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="invoice-lines">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>No of Sessions</th>
                <th>Session Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Archery coaching</td>
                <td>
                  <input type="number" min="0" className="invoice-input" value={coachingSessions} onChange={(e) => setCoachingSessions(e.target.value)} />
                </td>
                <td>
                  <input type="number" min="0" className="invoice-input" value={coachingRate} onChange={(e) => setCoachingRate(e.target.value)} />
                </td>
                <td>{formatNumber(coachingAmount)}</td>
              </tr>

              <tr>
                <td>
                  <input type="text" className="invoice-input" value={tournamentTitle} onChange={(e) => setTournamentTitle(e.target.value)} />
                </td>
                <td />
                <td />
                <td>
                  <input type="number" min="0" className="invoice-input" value={tournamentAmount} onChange={(e) => setTournamentAmount(e.target.value)} />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-total">
            <div className="invoice-total__label">Total:</div>
            <div className="invoice-total__value">{formatNumber(totalAmount)}</div>
          </div>

          <div className="invoice-words">Total amount in words: {amountInWords}</div>
        </section>

        <section className="invoice-payment">
          <h3>Payment details:</h3>
          <div>BAFL Foundation</div>
          <div>Bank name - HDFC Bank</div>
          <div>Branch - Wanowrie</div>
          <div>Account number - 50200088770120</div>
          <div>IFSC - HDFC0000486</div>
          <div>Pan Card no - AAMCB1807H</div>
        </section>

        <section className="invoice-notes">
          <label className="invoice-label">Additional Notes</label>
          <textarea className="invoice-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </section>

        <footer className="invoice-footer">
          <div className="invoice-signature">
            <div>__________________________</div>
            <div>Signature</div>
          </div>

          <div className="invoice-actions">
            <button className="invoice-btn" onClick={handlePrint}>Download Invoice (PDF)</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

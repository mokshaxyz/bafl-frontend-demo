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

export default function BlankInvoicePage() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [billedTo, setBilledTo] = useState('');
  const [billingFromDate, setBillingFromDate] = useState(todayISO());
  const [billingToDate, setBillingToDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', amount: 0 },
    { id: 2, description: '', amount: 0 },
  ]);

  const totalAmount = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [lineItems]);

  const amountInWords = useMemo(() => {
    const words = convertNumberToWords(Number(totalAmount));
    if (!words) return '';
    return words.replace(/^[a-z]/, (m) => m.toUpperCase());
  }, [totalAmount]);

  const formatNumber = (n) => Number(n).toLocaleString();

  const handleLineItemChange = (id, field, value) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map((i) => i.id), 0) + 1;
    setLineItems([...lineItems, { id: newId, description: '', amount: 0 }]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handlePrint = () => {
    const payload = {
      invoiceNumber,
      invoiceDate,
      billedTo,
      billingPeriod: { from: billingFromDate, to: billingToDate },
      lineItems: lineItems.map((item) => ({
        description: item.description,
        amount: Number(item.amount),
      })),
      totalAmount: Number(totalAmount),
      amountInWords,
      notes
    };
    console.log(JSON.stringify(payload, null, 2));
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
            <textarea
              className="invoice-textarea"
              value={billedTo}
              onChange={(e) => setBilledTo(e.target.value)}
              placeholder="Enter name and address here"
              rows="4"
            />
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
                <th>Amount</th>
                <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      className="invoice-input"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="invoice-input"
                      value={item.amount}
                      onChange={(e) => handleLineItemChange(item.id, 'amount', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => removeLineItem(item.id)}
                      style={{
                        background: '#ccc',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={addLineItem}
            style={{
              marginTop: '12px',
              padding: '6px 12px',
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Add Item
          </button>

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

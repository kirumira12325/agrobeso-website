import { useState } from 'react';
import { Link } from 'react-router-dom';

const SUPABASE_URL = 'https://kbopqzhfckbhkumiinmk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtib3BxemhmY2tiaGt1bWlpbm1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Nzc3ODAsImV4cCI6MjA5MzQ1Mzc4MH0.fklxNFN7hzi8mzIWCfUva4qBK_-ROKn-HGCoFscoA5w';

const LOCATIONS = [
  { id: 'thornton-heath', name: 'Thornton Heath', address: '23 Brigstock Road, Thornton Heath CR7 7JJ', phone: '02086846699' },
  { id: 'peckham', name: 'Peckham', address: '139 Peckham High Street, Peckham, SE15 5SL', phone: '02077323721' },
];

const TIME_SLOTS = [
  '12:00 pm','12:30 pm','01:00 pm','01:30 pm','02:00 pm','02:30 pm',
  '03:00 pm','03:30 pm','04:00 pm','04:30 pm','05:00 pm','05:30 pm',
  '06:00 pm','06:30 pm','07:00 pm','07:30 pm','08:00 pm','08:30 pm','09:00 pm',
];

function generateReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'AGR-';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

interface FormData {
  location: string; date: string; time: string; name: string;
  phone: string; email: string; guests: number; notes: string;
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#5a4a35', marginBottom: '0.4rem', fontFamily: 'Georgia, serif'
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem', border: '2px solid #d4c5a9', borderRadius: '6px',
  fontSize: '1rem', fontFamily: 'Georgia, serif', color: '#2c1810', background: 'white',
  boxSizing: 'border-box', outline: 'none'
};
const primaryBtnStyle: React.CSSProperties = {
  flex: 1, padding: '0.85rem 1.5rem', background: '#2c1810', color: 'white',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
  fontFamily: 'Georgia, serif', letterSpacing: '0.05em'
};
const disabledBtnStyle: React.CSSProperties = {
  flex: 1, padding: '0.85rem 1.5rem', background: '#c5b8a4', color: 'white',
  border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontSize: '0.9rem',
  fontFamily: 'Georgia, serif', letterSpacing: '0.05em'
};
const backBtnStyle: React.CSSProperties = {
  padding: '0.85rem 1.5rem', background: 'white', color: '#5a4a35',
  border: '2px solid #d4c5a9', borderRadius: '6px', cursor: 'pointer',
  fontSize: '0.9rem', fontFamily: 'Georgia, serif'
};

export default function ReservePage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({ location:'',date:'',time:'',name:'',phone:'',email:'',guests:2,notes:'' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{reference:string}|null>(null);
  const [error, setError] = useState('');

  const selectedLocation = LOCATIONS.find(l => l.id === form.location);

  function update(field: keyof FormData, value: string|number) {
    setForm(prev => ({...prev,[field]:value}));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    const reference = generateReference();
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          reference, location: selectedLocation?.name || form.location,
          date: form.date, time: form.time, name: form.name,
          phone: form.phone, email: form.email, guests: form.guests,
          notes: form.notes, status: 'pending'
        })
      });
      if (!res.ok) throw new Error('Booking failed. Please try again.');
      setConfirmation({reference});
      setStep(4);
    } catch(e:any) {
      setError(e.message||'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  const progressW = step===4?'100%':step===1?'25%':step===2?'50%':'75%';

  return (
    <div style={{background:'#f5f1ea',minHeight:'100vh',fontFamily:'Georgia,serif'}}>
      <nav style={{background:'#f5f1ea',borderBottom:'1px solid #d4c5a9',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link to="/" style={{fontFamily:'serif',fontSize:'1.25rem',fontWeight:700,color:'#2c1810',textDecoration:'none',letterSpacing:'0.05em'}}>Agrobeso</Link>
        <Link to="/" style={{fontSize:'0.8rem',letterSpacing:'0.1em',color:'#8b7355',textDecoration:'none',textTransform:'uppercase'}}>← Back to site</Link>
      </nav>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'2rem 1.5rem 4rem'}}>
        {step<4&&(
          <>
            <p style={{fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#8b7355',marginBottom:'0.5rem'}}>Reserve a Table</p>
            <h1 style={{fontSize:'clamp(2rem,6vw,3rem)',fontWeight:400,color:'#2c1810',margin:'0 0 0.5rem',lineHeight:1.1}}>Join us for a meal.</h1>
            <p style={{color:'#6b5b45',marginBottom:'2rem'}}>No payment required — we'll confirm your table by phone.</p>
            <div style={{marginBottom:'2.5rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                {['Location','Date & Time','Your Details'].map((label,i)=>(
                  <span key={label} style={{fontSize:'0.7rem',letterSpacing:'0.1em',textTransform:'uppercase',color:step>i+1?'#c17d3c':step===i+1?'#2c1810':'#9e8870',fontWeight:step===i+1?700:400}}>{label}</span>
                ))}
              </div>
              <div style={{height:'3px',background:'#d4c5a9',borderRadius:'2px',overflow:'hidden'}}>
                <div style={{height:'100%',background:'#c17d3c',width:progressW,transition:'width 0.4s ease'}}/>
              </div>
            </div>
          </>
        )}

        {step===1&&(
          <div>
            <h2 style={{fontSize:'1.25rem',fontWeight:400,color:'#2c1810',marginBottom:'1.5rem'}}>Choose a location</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {LOCATIONS.map(loc=>(
                <button key={loc.id} onClick={()=>{update('location',loc.id);setStep(2);}}
                  style={{border:form.location===loc.id?'2px solid #c17d3c':'2px solid #d4c5a9',background:form.location===loc.id?'#fdf9f4':'white',borderRadius:'8px',padding:'1.5rem',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}>
                  <div style={{fontWeight:700,fontSize:'1.1rem',color:'#2c1810',marginBottom:'0.25rem'}}>{loc.name}</div>
                  <div style={{color:'#6b5b45',fontSize:'0.9rem'}}>{loc.address}</div>
                  <div style={{color:'#c17d3c',fontSize:'0.85rem',marginTop:'0.25rem'}}>{loc.phone}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step===2&&(
          <div>
            <h2 style={{fontSize:'1.25rem',fontWeight:400,color:'#2c1810',marginBottom:'1.5rem'}}>Pick a date and time</h2>
            <div style={{marginBottom:'1.5rem'}}>
              <label style={labelStyle}>Date</label>
              <input type="date" min={getMinDate()} value={form.date} onChange={e=>update('date',e.target.value)} style={inputStyle}/>
            </div>
            {form.date&&(
              <div style={{marginBottom:'1.5rem'}}>
                <label style={labelStyle}>Time</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
                  {TIME_SLOTS.map(slot=>(
                    <button key={slot} onClick={()=>update('time',slot)}
                      style={{border:form.time===slot?'2px solid #c17d3c':'2px solid #d4c5a9',background:form.time===slot?'#c17d3c':'white',color:form.time===slot?'white':'#2c1810',padding:'0.6rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem',fontFamily:'Georgia,serif',transition:'all 0.15s'}}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:'flex',gap:'1rem',marginTop:'2rem'}}>
              <button onClick={()=>setStep(1)} style={backBtnStyle}>← Back</button>
              <button onClick={()=>setStep(3)} disabled={!form.date||!form.time} style={form.date&&form.time?primaryBtnStyle:disabledBtnStyle}>Continue →</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div>
            <h2 style={{fontSize:'1.25rem',fontWeight:400,color:'#2c1810',marginBottom:'1.5rem'}}>Your details</h2>
            <div style={{background:'white',border:'1px solid #d4c5a9',borderRadius:'8px',padding:'1rem 1.25rem',marginBottom:'1.75rem',fontSize:'0.9rem',color:'#5a4a35'}}>
              <div><strong style={{color:'#2c1810'}}>{selectedLocation?.name}</strong> — {selectedLocation?.address}</div>
              <div style={{marginTop:'0.3rem'}}>{formatDate(form.date)} at {form.time}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
              <div><label style={labelStyle}>Full Name *</label><input type="text" placeholder="Your name" value={form.name} onChange={e=>update('name',e.target.value)} style={inputStyle}/></div>
              <div><label style={labelStyle}>Phone Number *</label><input type="tel" placeholder="07xxx xxxxxx" value={form.phone} onChange={e=>update('phone',e.target.value)} style={inputStyle}/></div>
              <div><label style={labelStyle}>Email Address *</label><input type="email" placeholder="your@email.com" value={form.email} onChange={e=>update('email',e.target.value)} style={inputStyle}/></div>
              <div>
                <label style={labelStyle}>Number of Guests *</label>
                <select value={form.guests} onChange={e=>update('guests',parseInt(e.target.value))} style={inputStyle}>
                  {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?'guest':'guests'}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Special Requests (optional)</label><textarea placeholder="Dietary requirements, accessibility needs, celebrations..." value={form.notes} onChange={e=>update('notes',e.target.value)} rows={3} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            {error&&<p style={{color:'#c0392b',fontSize:'0.9rem',marginTop:'1rem'}}>{error}</p>}
            <div style={{display:'flex',gap:'1rem',marginTop:'2rem'}}>
              <button onClick={()=>setStep(2)} style={backBtnStyle}>← Back</button>
              <button onClick={handleSubmit} disabled={submitting||!form.name||!form.phone||!form.email} style={submitting||!form.name||!form.phone||!form.email?disabledBtnStyle:primaryBtnStyle}>
                {submitting?'Confirming...':'Confirm Reservation →'}
              </button>
            </div>
          </div>
        )}

        {step===4&&confirmation&&(
          <div style={{textAlign:'center',paddingTop:'2rem'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem',color:'#c17d3c'}}>✓</div>
            <p style={{fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#c17d3c',marginBottom:'0.5rem'}}>Booking Confirmed</p>
            <h1 style={{fontSize:'clamp(1.75rem,5vw,2.5rem)',fontWeight:400,color:'#2c1810',margin:'0 0 1.5rem',lineHeight:1.1}}>See you soon!</h1>
            <div style={{background:'white',border:'2px solid #d4c5a9',borderRadius:'12px',padding:'2rem',marginBottom:'2rem'}}>
              <p style={{fontSize:'0.75rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'#8b7355',marginBottom:'0.5rem'}}>Booking Reference</p>
              <p style={{fontSize:'2rem',fontWeight:700,color:'#c17d3c',letterSpacing:'0.1em',margin:'0 0 1.25rem'}}>{confirmation.reference}</p>
              <div style={{borderTop:'1px solid #e8ddd0',paddingTop:'1rem',fontSize:'0.9rem',color:'#5a4a35',textAlign:'left'}}>
                <div style={{marginBottom:'0.4rem'}}><strong>Location:</strong> {selectedLocation?.name}</div>
                <div style={{marginBottom:'0.4rem'}}><strong>Address:</strong> {selectedLocation?.address}</div>
                <div style={{marginBottom:'0.4rem'}}><strong>Date:</strong> {formatDate(form.date)}</div>
                <div style={{marginBottom:'0.4rem'}}><strong>Time:</strong> {form.time}</div>
                <div style={{marginBottom:'0.4rem'}}><strong>Guests:</strong> {form.guests}</div>
                <div><strong>Name:</strong> {form.name}</div>
              </div>
            </div>
            <p style={{color:'#6b5b45',marginBottom:'0.75rem'}}>We'll call you on <strong>{form.phone}</strong> to confirm.</p>
            <p style={{color:'#9e8870',fontSize:'0.85rem',marginBottom:'2rem'}}>Please save your reference: <strong>{confirmation.reference}</strong></p>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem',alignItems:'center'}}>
              <Link to="/" style={{...primaryBtnStyle,textDecoration:'none',display:'inline-block'}}>Back to Menu</Link>
              <button onClick={()=>{setStep(1);setForm({location:'',date:'',time:'',name:'',phone:'',email:'',guests:2,notes:''});setConfirmation(null);}} style={{background:'none',border:'none',color:'#8b7355',cursor:'pointer',fontSize:'0.9rem',textDecoration:'underline'}}>Make another reservation</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

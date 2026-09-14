import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Pax from '@/components/Pax';

const steps = [
  { num: '01', title: 'DUMP', desc: "Put what's on your mind." },
  { num: '02', title: 'UNPACK', desc: "Understand what you're carrying." },
  { num: '03', title: 'TAKE ONE STEP', desc: 'Start with something manageable.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-midnight mb-4">UNPACK</h1>
        <p className="text-xl md:text-2xl text-bark/70 mb-8 max-w-md">
          You don't have to carry<br />it all at once.
        </p>
        <Pax state="idle" size="lg" />
        <div className="mt-8">
          <Link to="/unpack">
            <Button size="lg">Start Unpacking</Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-midnight text-center mb-12">How it works</h2>
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.num} className="flex items-start gap-4 animate-fade-in">
                <span className="text-coral font-bold text-lg whitespace-nowrap">{step.num} —</span>
                <div>
                  <h3 className="font-bold text-midnight text-lg">{step.title}</h3>
                  <p className="text-bark/70">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-4">
        <div className="max-w-xl mx-auto bg-peach/20 rounded-3xl p-6 text-center">
          <p className="text-bark/70 text-sm">
            UNPACK is a supportive mental well-being tool. It is not a substitute for
            professional therapy, counseling, or medical advice. If you're in crisis,
            please reach out to a mental health professional.
          </p>
        </div>
      </section>
    </div>
  );
}

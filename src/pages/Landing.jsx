import { Link } from "react-router-dom";
import {
  Coffee,
  Heart,
  BookOpen,
  ArrowRight,
  MessageCircle,
  Shield,
  Ghost,
} from "lucide-react";
import heroImg from "../assets/hero-illustration.png";
import Navbar from "../components/Navbar";
const features = [
  {
    icon: BookOpen,
    title: "Share Your Story",
    desc: "Write about your experiences, lessons learned, and personal growth in a supportive community.",
  },
  {
    icon: Ghost,
    title: "Stay Anonymous",
    desc: "Share your deepest thoughts without revealing your identity. Purple-tinted posts keep you safe.",
  },
  {
    icon: MessageCircle,
    title: "Meaningful Conversations",
    desc: "Engage in threaded discussions with nested replies, likes, and real-time interactions.",
  },
  {
    icon: Shield,
    title: "Safe Space",
    desc: "Community-driven moderation ensures respectful, empathetic interactions for everyone.",
  },
];
const testimonials = [
  {
    name: "Alex T.",
    text: "Expresso helped me open up about things I could never say out loud. The anonymous feature is a game-changer.",
    role: "Community member",
  },
  {
    name: "Priya M.",
    text: "Reading other people's experiences makes me feel less alone. This platform has genuine human connection.",
    role: "Daily diaryEntrieser",
  },
  {
    name: "Jordan K.",
    text: "The comment system feels so natural. Conversations here are deeper than any other social platform I've used.",
    role: "Writer & creator",
  },
];
const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
              <Coffee className="h-4 w-4" />
              <span>A social diaryEntries for real humans</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl leading-tight text-foreground">
              Pour your thoughts.
              <br />
              <span className="text-primary">Sip on wisdom.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Expresso is where people share life experiences, lessons, and raw
              thoughts — openly or anonymously. A cozy corner of the internet
              for genuine stories.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground press-scale hover:opacity-90 transition-opacity"
              >
                Start Sharing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-medium text-foreground press-scale hover-lift"
              >
                Explore Stories
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center animate-fade-in-up">
            <img
              src={heroImg}
              alt="Person diaryEntriesing at a cozy café"
              width={500}
              height={500}
              className="w-full max-w-md"
            />
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
              Why people love Expresso
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              A platform designed for depth, not dopamine.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-background p-6 hover-lift"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 inline-flex rounded-xl bg-secondary p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg mb-2 text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-14 text-foreground">
            Voices from the community
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-card p-6 hover-lift"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Heart
                      key={j}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">
                  "{t.text}"
                </p>
                <div>
                  <p className="font-medium text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg text-primary">Expresso</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                to="/login"
                className="hover:text-foreground transition-colors"
              >
                Explore
              </Link>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Expresso. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;

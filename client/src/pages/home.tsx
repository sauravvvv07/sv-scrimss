import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Wallet, Shield, TrendingUp, Clock } from "lucide-react";
import heroImage from "@assets/generated_images/bgmi_esports_tournament_hero_image.png";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Trophy,
      title: "Competitive Scrims",
      description: "Join daily scrims and tournaments with prize pools",
    },
    {
      icon: Users,
      title: "Find Teammates",
      description: "Connect with players and build your squad",
    },
    {
      icon: Wallet,
      title: "Secure Payments",
      description: "UPI-based payments with instant verification",
    },
    {
      icon: Shield,
      title: "Anti-Cheat",
      description: "Fair play enforcement and player reporting",
    },
    {
      icon: TrendingUp,
      title: "Live Leaderboards",
      description: "Track your rank and climb the ladder",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get room credentials 10 minutes before matches",
    },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={heroImage}
          alt="BGMI Tournament"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              BGIS 2026 Practice Scrims
              <br />
              Play Like the Pros
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              India's most competitive practice lobbies featuring upcoming pro's
              and competetive teams
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link href="/scrims">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground backdrop-blur-sm"
                    data-testid="button-browse-scrims"
                  >
                    Browse Scrims
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-primary text-primary-foreground backdrop-blur-sm"
                      data-testid="button-get-started"
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                      data-testid="button-view-leaderboard"
                    >
                      View Leaderboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose SV Scrims?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for competitive BGMI gaming in one platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            let href = "/";

            // Add navigation for specific features
            if (feature.title === "Competitive Scrims") {
              href = user ? "/scrims" : "/signup";
            } else if (feature.title === "Find Teammates") {
              href = user ? "/teammates" : "/signup";
            } else if (feature.title === "Live Leaderboards") {
              href = "/leaderboard";
            }

            return (
              <Link key={index} href={href}>
                <Card className="hover-elevate cursor-pointer h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="bg-primary text-primary-foreground border-primary-border">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Compete?
            </h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Join thousands of players competing in daily scrims and
              tournaments
            </p>
            {!user && (
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  data-testid="button-signup-cta"
                >
                  Create Your Account
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

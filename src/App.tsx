import JsonLd from "@/components/layout/JsonLd";
import SkipLink from "@/components/layout/SkipLink";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";

export function App() {
  return (
    <>
      <SkipLink />
      <Navbar />
      <main id="main">
        <Home />
      </main>
      <Footer />
      <JsonLd />
    </>
  );
}

export default App;

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import svgList from "./svg-list.json";
import './App.css';

const App: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showStrokeNumbers, setShowStrokeNumbers] = useState(true);
  const [textElementsData, setTextElementsData] = useState<
    d3.BaseType[] | null
  >(null);
  const [animatePaths, setAnimatePaths] = useState(false);
  const [inputCharacter, setInputCharacter] = useState("");
  const [inputHex, setInputHex] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);

  useEffect(() => {
    const unicodeCharacters = svgList
      .filter((filename: string) => filename.length === 9)
      .map((filename: string) => {
        const hex = filename.slice(0, 5);
        const codePoint = parseInt(hex, 16);
        return String.fromCodePoint(codePoint);
      });
    setCharacters(unicodeCharacters);
  }, []);

  const handleCharacterClick = (character: string) => {
    const unicodeValue = character.charCodeAt(0);
    const unicodeHex = unicodeValue.toString(16).padStart(5, "0");
    setInputCharacter(character);
    setInputHex(unicodeHex);
  };

  useEffect(() => {
    if (!svgRef.current || !inputHex) {
      return;
    }

    const svgUrl = `/kanjivg/kanji/${inputHex}.svg`;

    // Fetch and render the SVG
    fetch(svgUrl)
      .then((response) => response.text())
      .then((data) => {
        svgRef.current!.innerHTML = data;
        const svgElement = d3.select(svgRef.current).select("svg");
        const strokeNumbers = svgElement.select(
          `#kvg\\:StrokeNumbers_${inputHex}`
        );
        const textElements = strokeNumbers.selectAll("text").nodes();
        setTextElementsData(textElements);
        if (!showStrokeNumbers) {
          strokeNumbers.selectAll("text").remove();
        }
        setAnimatePaths(true);
      });
  }, [svgRef, inputHex, showStrokeNumbers]);

  const handleCharacterInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const character = event.target.value;
    setInputCharacter(character);
    if (character.length === 1) {
      const unicodeValue = character.charCodeAt(0);
      const unicodeHex = unicodeValue.toString(16).padStart(5, "0");
      setInputHex(unicodeHex);
    } else {
      setInputHex("");
    }
  };

  useEffect(() => {
    if (!svgRef.current || !textElementsData) {
      return;
    }

    const strokeNumbers: any = d3
      .select(svgRef.current)
      .select(`#kvg\\:StrokeNumbers_${inputHex}`);
    strokeNumbers.selectAll("text").remove();

    if (showStrokeNumbers) {
      textElementsData.forEach((textElement) => {
        strokeNumbers.node().appendChild(textElement);
      });
    }
  }, [showStrokeNumbers, textElementsData]);

  useEffect(() => {
    if (!svgRef.current || !inputHex) {
      return;
    }

    const svgElement = d3.select(svgRef.current).select("svg");
    const strokePaths = svgElement.select(`#kvg\\:StrokePaths_${inputHex}`);
    const paths = strokePaths.selectAll("path");

    const animateSequentially = (paths: any, index: number) => {
      if (index >= paths.size()) {
        setAnimatePaths(false);
        return;
      }

      const path = paths.filter((_: any, i: number) => i === index);
      const pathLength = (path.node() as any).getTotalLength();
      path.attr("stroke-dasharray", pathLength);
      path.attr("stroke-dashoffset", pathLength);
      path.attr("opacity", 1);

      path
        .transition()
        .duration(path.node().getTotalLength() * 8)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          if (animatePaths) {
            animateSequentially(paths, index + 1);
          }
        });
    };

    if (animatePaths) {
      paths.attr("opacity", 0);
      animateSequentially(paths, 0);
    } else {
      // Remove the animation and reset the paths to their original state
      paths.interrupt();
      paths.attr("stroke-dasharray", null);
      paths.attr("stroke-dashoffset", null);
      paths.attr("opacity", 1);
    }
  }, [animatePaths]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let drawing = false;

    function startDrawing(e: MouseEvent) {
      drawing = true;
      draw(e);
    }

    function erase() {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    function draw(e: MouseEvent) {
      if (!drawing || !ctx) return;
      if (canvas) {
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
  
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
  
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }   
    }

    function stopDrawing() {
      drawing = false;
      if (ctx) {
        ctx.beginPath();
      }
    }

    if (canvas) {
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('dblclick', erase);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('dblclick', erase);
      }
    };
  }, []);

  const handleToggleStrokeNumbers = () => {
    setShowStrokeNumbers(!showStrokeNumbers);
  };

  return (
    <div className="App">
      <h1>Kanji Learning Tool</h1>
      <div className = "Kanji">
      <canvas
        className="Kanji-Canvas"
        width="109px"
        height="109px"
        ref={canvasRef}
      >
      </canvas>
      <svg ref={svgRef} className = "Kanji-SVG"/>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={showStrokeNumbers}
            onChange={handleToggleStrokeNumbers}
          />
          Show Stroke Numbers
        </label>
      </div>
      <div>
        <input
          type="checkbox"
          id="animatePaths"
          checked={animatePaths}
          onChange={(e) => setAnimatePaths(e.target.checked)}
        />
        <label htmlFor="animatePaths">Animate Paths</label>
      </div>
      <div>
        <label htmlFor="characterInput">Enter a Kanji character:</label>
        <input
          type="text"
          id="characterInput"
          maxLength={1}
          value={inputCharacter}
          onChange={handleCharacterInput}
        />
      </div>

      
      <div
        style={{
          height: "200px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
          width: "100px",
        }}
      >
        {characters.map((character, index) => (
          <div
            key={index}
            onClick={() => handleCharacterClick(character)}
            style={{ cursor: "pointer" }}
          >
            {character}
          </div>
        ))}
      </div>
    </div>
  );
};
export default App;

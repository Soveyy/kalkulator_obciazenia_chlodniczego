
import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useCalculator } from '../../contexts/CalculatorContext';

const MethodologyModal: React.FC = () => {
    const { state, dispatch } = useCalculator();
    const isOpen = state.modal.isOpen && state.modal.type === 'methodology';

    const handleClose = () => dispatch({ type: 'SET_MODAL', payload: { isOpen: false } });

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title="Metodologia Obliczeniowa"
            maxWidth="max-w-4xl"
            footer={<Button onClick={handleClose}>Zamknij</Button>}
        >
            <div className="prose prose-sm dark:prose-invert max-w-none">
                 <p>Kalkulator wykorzystuje zaawansowane, zgodne ze standardami inżynierskimi metody do symulacji zysków ciepła przez przegrody przezroczyste (okna). Poniższe punkty szczegółowo opisują proces obliczeniowy.</p>
                <ol>
                    <li>
                        <strong>Podstawa Klimatyczna – Dwa Scenariusze Pogodowe</strong>
                        <p>U podstaw wszystkich obliczeń leżą dane klimatyczne dla lokalizacji Warszawa (52.23°N, 21.01°E). Aby zapewnić pełen obraz analityczny, kalkulator korzysta z dwóch niezależnych, godzinowych baz danych.</p>
                        <ul>
                            <li><strong>Scenariusz Projektowy (Clear Sky):</strong> Wykorzystuje dane z bazy NSRDB (National Solar Radiation Database). Reprezentuje on teoretyczne, maksymalne nasłonecznienie w idealnych, bezchmurnych warunkach i jest kluczowy przy projektowaniu systemów chłodzenia.</li>
                            <li><strong>Scenariusz Typowy (Global):</strong> Wykorzystuje dane z bazy PVGIS (Photovoltaic Geographical Information System), bazujące na tzw. "typowym roku meteorologicznym" (TMY). Dane te uwzględniają statystyczne, wieloletnie uśrednione zachmurzenie, co reprezentuje bardziej realistyczny, przeciętny dzień.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Przetwarzanie Danych Nasłonecznienia</strong>
                        <p>Dane źródłowe dotyczące nasłonecznienia są przeliczane z płaszczyzny horyzontalnej na płaszczyzny pionowe o różnych orientacjach (azymutach), odpowiadających kierunkowi okien. Kalkulacje te zostały wykonane z użyciem anizotropowego modelu Pereza, który precyzyjnie rozdziela promieniowanie na składową bezpośrednią (Gb) i rozproszoną (Gd) oraz oblicza kąt padania promieni słonecznych na szybę (theta) dla każdej godziny.</p>
                    </li>
                    <li>
                        <strong>Zaawansowany Model Fizyczny Przeszklenia</strong>
                        <p>Kalkulator uwzględnia zmianę współczynnika SHGC okna w zależności od rodzaju promieniowania i kąta padania. Podstawą obliczeń zysków ciepła od nasłonecznienia dla każdej godziny jest następująca zależność fizyczna:<br /><i>Q<sub>sol</sub> = A * [ I<sub>b</sub> * SHGC(θ) + I<sub>d</sub> * SHGC<sub>d</sub> ]</i></p>
                        <ul>
                            <li><strong>Dynamiczny Współczynnik SHGC:</strong> Zaimplementowano krzywe korekcyjne, które dynamicznie redukują SHGC dla promieniowania bezpośredniego wraz ze wzrostem kąta padania. Takie dynamiczne podejście jest kluczowe, ponieważ stosowanie stałego współczynnika SHGC prowadziłoby do znacznego <strong>zawyżenia</strong> szacowanych zysków ciepła.</li>
                            <li><strong>Podział Zysków od Przewodzenia:</strong> Zysk ciepła wynikający z różnicy temperatur (Q = U * A * ΔT) jest dzielony na dwie składowe: konwekcyjną (natychmiastową) i radiacyjną (opóźnioną).</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Model Akumulacji Ciepła (Metoda RTS)</strong>
                        <p>Aby precyzyjnie symulować, jak zyski ciepła przekładają się na faktyczne obciążenie chłodnicze, kalkulator implementuje Metodę Szeregów Czasowych Promieniowania <strong>(Radiant Time Series - RTS)</strong>, opisaną w standardach ASHRAE.</p>
                        <ul>
                            <li><strong>Fizyczna zasada:</strong> Zyski o charakterze radiacyjnym są najpierw absorbowane przez masę termiczną budynku, a następnie uwalniane do pomieszczenia z opóźnieniem.</li>
                            <li><strong>Implementacja matematyczna:</strong> Algorytm rozkłada obliczone zyski radiacyjne z każdej godziny na 24 kolejne godziny. Współczynniki użyte do tego rozkładu w czasie (RTS factors) pochodzą bezpośrednio z opracowań ASHRAE.</li>
                        </ul>
                    </li>
                </ol>
                <hr />
                <strong>Główne Założenia i Ograniczenia:</strong>
                <ul>
                    <li>Kalkulator koncentruje się wyłącznie na zyskach ciepła <strong>przez okna</strong>.</li>
                    <li>Model nie uwzględnia zysków/strat przez ściany nieprzezroczyste, dach, podłogę na gruncie oraz infiltrację/wentylację.</li>
                    <li>Kalkulator jest w fazie aktywnego rozwoju.</li>
                </ul>
            </div>
        </Modal>
    );
};

export default MethodologyModal;

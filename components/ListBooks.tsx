import useLocalStorage from "@/hooks/useLocalStorage";
import { animated, useSpring } from "@react-spring/web";
import { animateOpacity } from "@/utils/helpers";
import { animListAtom, searchAtom, stateAtom } from "@/utils/atoms";
import { noop } from "es-toolkit";
import { useRecoilState } from "recoil";
import type { Component } from "@/utils/types";
import { useEffect, useRef } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

export default function ListBooks(props: Props): Component {
  const { listBooks, renderItem, showDetails } = props,
    [searchVal] = useRecoilState<string>(searchAtom),
    [stateVal] = useRecoilState<string>(stateAtom),
    [animateCard] = useRecoilState<boolean>(animListAtom),
    [animations] = useLocalStorage("animations", true),
    [styles, api] = useSpring(() => noop()),
    parentRef = useRef<HTMLDivElement>(null),
    rowVirtualizer = useWindowVirtualizer({
      count: listBooks.length,
      estimateSize: () => (showDetails ? 130 : 60),
      gap: showDetails ? 16 : 7,
      overscan: 5,
      scrollMargin: parentRef.current?.offsetTop ?? 0,
    });

  useEffect(() => {
    if (!animations) return;
    api.start(animateOpacity(1, 600));
  }, [animateCard, searchVal, stateVal]);

  return (
    <animated.div
      style={styles}
      className="mb-36 flex flex-col justify-start w-full items-center sm:overflow-hidden h-auto"
      data-testid="list-books"
      ref={parentRef}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const item = listBooks[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${
                  virtualRow.start - rowVirtualizer.options.scrollMargin
                }px)`,
              }}
              data-index={virtualRow.index}
              ref={el => {
                rowVirtualizer.measureElement(el);
                if (el) console.log("medido:", virtualRow.index, el.getBoundingClientRect().height);
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </animated.div>
  );
}

interface Props {
  listBooks: BookData[];
  renderItem: (book: BookData, index: number) => Component;
  showDetails: boolean;
}

interface BookData {
  title?: string;
  author?: string;
  image?: string;
  gender?: string;
  state?: string;
  notes?: string;
  owner?: string;
  isFav?: boolean;
  loaned?: string;
  url?: string;
}

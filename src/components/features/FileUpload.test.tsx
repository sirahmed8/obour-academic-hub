/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileAttachmentDisplay } from "./FileUpload";
import React from "react";

// Mock hooks
vi.mock("@/contexts", () => ({
  useLanguage: () => ({
    language: "en",
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ fill, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img {...props} data-fill={fill} />
  ),
}));

describe("FileAttachmentDisplay", () => {
  const imageAttachment = {
    url: "https://example.com/image.jpg",
    type: "image" as const,
    name: "test-image.jpg",
    size: 1024,
  };

  it("opens lightbox with accessibility attributes when image is clicked", () => {
    render(<FileAttachmentDisplay attachment={imageAttachment} />);

    // Click the image to open lightbox.
    // Note: In the component, Image is wrapped in a div with onClick.
    // We can find the image by alt text.
    const image = screen.getByAltText("test-image.jpg");
    // Fire click on the parent div which has the handler
    fireEvent.click(image.parentElement!);

    // Check for dialog role
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Image preview");

    // Check for close button
    const closeButton = screen.getByLabelText("Close preview");
    expect(closeButton).toBeInTheDocument();
  });
});

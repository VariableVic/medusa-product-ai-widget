import type { WidgetConfig, ProductDetailsWidgetProps } from "@medusajs/admin";
import { useAdminUpdateProduct } from "medusa-react";
import { Button, Container, Text, Tooltip } from "@medusajs/ui";
import { useState } from "react";
import { Message, useChat } from "ai/react";
import { CheckMini } from "@medusajs/icons";
import { Prompts } from "../../../types/product-ai-tools";

type PromptButtonProps = {
  type: string;
  getCompletion: (type: string) => void;
  button_text: string;
  tooltip?: string;
  isLoading?: boolean;
};

const backendUrl =
  process.env.MEDUSA_BACKEND_URL === "/"
    ? location.origin
    : process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

// Set up the available prompts and their button text
const prompts: Prompts = {
  fix_writing: "Fix writing",
  make_longer: "Make longer",
  make_shorter: "Make shorter",
  improve_seo: "Optimize for SEO",
};

const ProductAIToolsWidget = ({
  product,
  notify,
}: ProductDetailsWidgetProps) => {
  // Keep track of which button was clicked for loading state
  const [clickedButton, setClickedButton] = useState("");

  // Hook to update product description
  const { mutateAsync, isLoading: productLoading } = useAdminUpdateProduct(
    product.id
  );

  // Hook to get completion from AI
  const { isLoading, messages, setMessages, reload } = useChat({
    api: `${backendUrl}/admin/completion/product-descriptions`,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  // Get completion from AI
  const getCompletion = (type: string) => {
    // Set loading state
    setClickedButton(type);

    // Set system prompt
    const systemPrompt: Message[] = [
      {
        id: "sysprompt",
        role: "system",
        content:
          "You're a product description AI tool. Your onky task is to help merchants improve their product descriptions. You're immaculate at spelling and grammar, and you know how to optimize for SEO and conversion. You always obey the prompt exactly. You exclusively return the optimized product description, and introduce no contextual information. Your descriptions are between 120 and 160 characters long, unless asked to make shorter or longer.",
      },
    ];

    // Set user prompt
    setMessages(systemPrompt);

    // Get completion from AI
    reload({
      options: {
        body: {
          type,
          description: product.description,
          keyword: product.title,
        },
      },
    });
  };

  // Get the response content from the AI
  const response = messages.find((m) => m.role === "assistant")?.content;

  // Update product description
  const updateProduct = async () => {
    await mutateAsync({
      description: response,
    })
      .then(() => {
        reset();
        notify.success("Succes!", "Product description updated.");
      })
      .catch((e) => {
        notify.error("Error", JSON.stringify(e.message));
      });
  };

  // Reset the chat
  const reset = () => {
    setMessages(messages.filter((m) => m.role !== "assistant"));
  };

  if (!product.description) return null;

  return (
    <Container className="p-8 flex flex-col gap-y-4 transition-transform">
      <h1 className="text-grey-90 inter-xlarge-semibold">
        Product Description AI Tools
      </h1>
      <Text className="text-grey-50">
        Use AI to improve your product description.
      </Text>
      <Text className="font-semibold">Current description:</Text>
      <Container className="bg-gray-50 p-4 whitespace-pre-wrap">
        {product.description}
      </Container>
      <div className="flex flex-wrap flex-row gap-3 items-start">
        {Object.keys(prompts).map((type) => (
          <PromptButton
            key={type}
            type={type}
            getCompletion={getCompletion}
            button_text={prompts[type]}
            isLoading={isLoading && clickedButton === type}
            tooltip={
              type === "improve_seo" ? `Keyword: ${product.title}` : null
            }
          />
        ))}
      </div>
      {response && (
        <div className="flex flex-col gap-y-4">
          <Text className="font-semibold">Optimized description:</Text>
          <Container className="bg-gray-50 p-4 whitespace-pre-wrap">
            {response}
          </Container>
          <div className="flex flex-row gap-3 self-end">
            <Button disabled={isLoading} onClick={reset} variant="secondary">
              Cancel
            </Button>
            <Button
              className="pl-4"
              disabled={isLoading}
              isLoading={productLoading}
              onClick={updateProduct}
            >
              Update product description
              {!productLoading && <CheckMini />}
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

const PromptButton = ({
  type,
  getCompletion,
  button_text,
  tooltip,
  isLoading,
}: PromptButtonProps) => {
  if (tooltip) {
    return (
      <Tooltip content={tooltip}>
        <Button
          key={type}
          type="submit"
          variant="secondary"
          onClick={() => getCompletion(type)}
          isLoading={isLoading}
        >
          {button_text}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      key={type}
      type="submit"
      variant="secondary"
      onClick={() => getCompletion(type)}
      isLoading={isLoading}
    >
      {button_text}
    </Button>
  );
};

export const config: WidgetConfig = {
  zone: "product.details.after",
};

export default ProductAIToolsWidget;
